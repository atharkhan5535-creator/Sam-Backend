<?php

/**
 * Subscription Billing Helper Functions
 * Reusable helpers for billing calculations, proration, and appointment data
 */

class BillingHelper
{
    /**
     * Calculate proration for flat rate plans
     * @param float $monthlyPrice - Monthly subscription price
     * @param date $subscriptionStart - Subscription start date
     * @param date $subscriptionEnd - Subscription end date
     * @param string $billingMonth - Billing month in YYYY-MM format
     * @return array Proration details
     */
    public static function calculateProration($monthlyPrice, $subscriptionStart, $subscriptionEnd, $billingMonth)
    {
        $year = (int) substr($billingMonth, 0, 4);
        $month = (int) substr($billingMonth, 5, 2);
        
        // Get first and last day of billing month
        $monthStart = new DateTime("$year-$month-01");
        $monthEnd = new DateTime("$year-" . ($month + 1) . "-01");
        $monthEnd->modify('-1 day');
        
        $daysInMonth = (int) $monthEnd->format('d');
        $subStart = new DateTime($subscriptionStart);
        $subEnd = new DateTime($subscriptionEnd);
        
        $proration = [
            'is_prorated' => false,
            'original_price' => $monthlyPrice,
            'effective_price' => $monthlyPrice,
            'days_billed' => $daysInMonth,
            'total_days_in_month' => $daysInMonth,
            'proration_factor' => 1.0,
            'reason' => null
        ];
        
        // Check if subscription starts mid-month
        if ($subStart > $monthStart && $subStart <= $monthEnd) {
            $daysRemaining = $subStart->diff($monthEnd)->days + 1;
            $proration['is_prorated'] = true;
            $proration['days_billed'] = $daysRemaining;
            $proration['proration_factor'] = $daysRemaining / $daysInMonth;
            $proration['effective_price'] = ($monthlyPrice / $daysInMonth) * $daysRemaining;
            $proration['reason'] = 'Subscription starts mid-month';
        }
        // Check if subscription ends mid-month
        elseif ($subEnd >= $monthStart && $subEnd < $monthEnd) {
            $daysActive = $monthStart->diff($subEnd)->days + 1;
            $proration['is_prorated'] = true;
            $proration['days_billed'] = $daysActive;
            $proration['proration_factor'] = $daysActive / $daysInMonth;
            $proration['effective_price'] = ($monthlyPrice / $daysInMonth) * $daysActive;
            $proration['reason'] = 'Subscription ends mid-month';
        }
        
        return $proration;
    }
    
    /**
     * Get completed appointments for a salon in a billing period
     * @param PDO $db - Database connection
     * @param int $salonId - Salon ID
     * @param string $billingMonth - Billing month in YYYY-MM format
     * @return array Appointment data
     */
    public static function getCompletedAppointments($db, $salonId, $billingMonth)
    {
        $startDate = $billingMonth . '-01';
        $endDate = date('Y-m-t', strtotime($startDate)); // Last day of month
        
        $stmt = $db->prepare("
            SELECT 
                a.appointment_id,
                a.appointment_date,
                a.final_amount,
                a.status,
                COUNT(DISTINCT aps.appointment_service_id) as services_count,
                COUNT(DISTINCT apc.appointment_package_id) as packages_count,
                COALESCE(SUM(aps.final_price), 0) as services_total,
                COALESCE(SUM(apc.final_price), 0) as packages_total
            FROM appointments a
            LEFT JOIN appointment_services aps ON a.appointment_id = aps.appointment_id
            LEFT JOIN appointment_packages apc ON a.appointment_id = apc.appointment_id
            WHERE a.salon_id = ?
            AND a.appointment_date BETWEEN ? AND ?
            AND a.status = 'COMPLETED'
            GROUP BY a.appointment_id
        ");
        
        $stmt->execute([$salonId, $startDate, $endDate]);
        $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Calculate totals
        $totalAppointments = count($appointments);
        $totalRevenue = array_sum(array_column($appointments, 'final_amount'));
        
        return [
            'appointments' => $appointments,
            'summary' => [
                'total_appointments' => $totalAppointments,
                'total_revenue' => round($totalRevenue, 2),
                'billing_month' => $billingMonth,
                'period_start' => $startDate,
                'period_end' => $endDate
            ]
        ];
    }
    
    /**
     * Check if invoice exists for subscription and billing month
     * @param PDO $db - Database connection
     * @param int $subscriptionId - Subscription ID
     * @param string $billingMonth - Billing month in YYYY-MM format
     * @return array|null Existing invoice or null
     */
    public static function checkInvoiceExists($db, $subscriptionId, $billingMonth)
    {
        $stmt = $db->prepare("
            SELECT invoice_salon_id, invoice_number, total_amount, payment_status, invoice_date
            FROM invoice_salon
            WHERE subscription_id = ?
            AND DATE_FORMAT(invoice_date, '%Y-%m') = ?
            LIMIT 1
        ");
        
        $stmt->execute([$subscriptionId, $billingMonth]);
        $invoice = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $invoice ?: null;
    }
    
    /**
     * Calculate subscription billing amount
     * @param array $subscription - Subscription data
     * @param array $plan - Plan data
     * @param array $appointments - Completed appointments data
     * @param string $billingMonth - Billing month in YYYY-MM format
     * @return array Billing calculation breakdown
     */
    public static function calculateBilling($subscription, $plan, $appointments, $billingMonth)
    {
        $taxRate = 0.18; // 18% GST
        
        $totalAppointments = $appointments['summary']['total_appointments'] ?? 0;
        $totalRevenue = $appointments['summary']['total_revenue'] ?? 0;
        
        $baseAmount = 0;
        $perAppointmentAmount = 0;
        $percentageAmount = 0;
        $proration = null;
        
        // Calculate based on plan type
        if ($plan['plan_type'] === 'flat') {
            // Calculate proration for flat plans
            $proration = self::calculateProration(
                $plan['flat_price'],
                $subscription['start_date'],
                $subscription['end_date'],
                $billingMonth
            );
            $baseAmount = $proration['effective_price'];
        } elseif ($plan['plan_type'] === 'per-appointments') {
            $perAppointmentAmount = $totalAppointments * ($plan['per_appointments_price'] ?? 0);
        } elseif ($plan['plan_type'] === 'Percentage-per-appointments') {
            $percentageAmount = $totalRevenue * (($plan['percentage_per_appointment'] ?? 0) / 100);
        }
        
        $subtotalAmount = $baseAmount + $perAppointmentAmount + $percentageAmount;
        $taxAmount = $subtotalAmount * $taxRate;
        $totalAmount = $subtotalAmount + $taxAmount;
        
        return [
            'usage' => [
                'total_appointments' => $totalAppointments,
                'total_revenue' => round($totalRevenue, 2)
            ],
            'proration' => $proration,
            'calculation' => [
                'base_amount' => round($baseAmount, 2),
                'per_appointment_amount' => round($perAppointmentAmount, 2),
                'percentage_amount' => round($percentageAmount, 2),
                'subtotal_amount' => round($subtotalAmount, 2),
                'tax_rate' => 18,
                'tax_amount' => round($taxAmount, 2),
                'total_amount' => round($totalAmount, 2)
            ],
            'billing_period' => [
                'month' => $billingMonth,
                'start_date' => $billingMonth . '-01',
                'end_date' => date('Y-m-t', strtotime($billingMonth . '-01'))
            ]
        ];
    }
    
    /**
     * Generate unique invoice number
     * @param int $salonId - Salon ID
     * @return string Invoice number
     */
    public static function generateInvoiceNumber($salonId)
    {
        $date = date('Ymd');
        $random = str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
        return 'INV-S-' . $salonId . '-' . $date . '-' . $random;
    }
    
    /**
     * Verify and calculate payment status
     * @param float $totalAmount - Invoice total amount
     * @param array $payments - Array of payment records
     * @return string Payment status (UNPAID, PARTIAL, PAID)
     */
    public static function calculatePaymentStatus($totalAmount, $payments = [])
    {
        $totalPaid = array_sum(array_column($payments, 'amount'));
        $epsilon = 0.01; // Allow small floating point differences
        
        if ($totalPaid >= $totalAmount - $epsilon) {
            return 'PAID';
        } elseif ($totalPaid > $epsilon) {
            return 'PARTIAL';
        } else {
            return 'UNPAID';
        }
    }
}
