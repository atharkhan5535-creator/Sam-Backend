<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../core/Request.php';
require_once __DIR__ . '/../../core/Response.php';

class DashboardController
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /*
    |--------------------------------------------------------------------------
    | 1️⃣ GET DASHBOARD STATS (ADMIN only)
    | - Returns 8 comprehensive KPI cards with trends
    |--------------------------------------------------------------------------
    */
    public function getStats()
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        // Get time period from query params
        $period = $_GET['period'] ?? 'month';
        $startDate = $_GET['start_date'] ?? null;
        $endDate = $_GET['end_date'] ?? null;

        // Calculate current and previous date ranges
        $currentRange = $this->getDateRange($period, $startDate, $endDate);
        $previousRange = $this->getPreviousDateRange($period, $currentRange);

        try {
            // ===== 1. REVENUE (Current Period) =====
            $revenueData = $this->getRevenueStats($salonId, $currentRange, $previousRange);
            
            // ===== 2. APPOINTMENTS =====
            $appointmentsData = $this->getAppointmentStats($salonId, $currentRange, $previousRange);
            
            // ===== 3. CUSTOMERS =====
            $customersData = $this->getCustomerStats($salonId, $currentRange, $previousRange);
            
            // ===== 4. STAFF =====
            $staffData = $this->getStaffStats($salonId, $currentRange, $previousRange);

            // ===== 5. SERVICES =====
            $servicesData = $this->getServiceStats($salonId, $currentRange, $previousRange);

            // ===== 6. PACKAGES =====
            $packagesData = $this->getPackageStats($salonId, $currentRange, $previousRange);

            // ===== 7. COMPLETION RATE =====
            $completionData = $this->getCompletionRateStats($salonId, $currentRange, $previousRange);

            // ===== 8. PENDING ACTIONS =====
            $pendingData = $this->getPendingStats($salonId, $currentRange, $previousRange);

            // ===== 9. TOP PERFORMERS (Staff Performance) =====
            $topPerformers = $this->getTopPerformers($salonId, $currentRange);

            // ===== 10. SERVICES CHART DATA =====
            $servicesChart = $this->getServicesChartData($salonId, $currentRange);

            // ===== 11. STATUS CHART DATA =====
            $statusChart = $this->getStatusChartData($salonId, $currentRange);

            // ===== 12. RECENT ACTIVITY =====
            $recentActivity = $this->getRecentActivity($salonId, 6);

            Response::json([
                "status" => "success",
                "data" => [
                    "period" => $period,
                    "date_range" => $currentRange,
                    "cards" => [
                        "revenue" => $revenueData,
                        "appointments" => $appointmentsData,
                        "customers" => $customersData,
                        "staff" => $staffData,
                        "services" => $servicesData,
                        "packages" => $packagesData,
                        "completion_rate" => $completionData,
                        "pending" => $pendingData
                    ],
                    "top_performers" => $topPerformers,
                    "services_chart" => $servicesChart,
                    "status_chart" => $statusChart,
                    "recent_activity" => $recentActivity
                ]
            ]);

        } catch (Exception $e) {
            error_log("Dashboard stats error: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            Response::json([
                "status" => "error",
                "message" => "Failed to fetch dashboard stats: " . $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | REVENUE STATS - Total & Trend
    |--------------------------------------------------------------------------
    */
    private function getRevenueStats($salonId, $currentRange, $previousRange)
    {
        $stmt = $this->db->prepare("
            SELECT COALESCE(SUM(final_amount), 0) as total, COUNT(*) as count
            FROM appointments
            WHERE salon_id = ? AND appointment_date BETWEEN ? AND ? AND status = 'COMPLETED'
        ");
        $stmt->execute([$salonId, $currentRange['start'], $currentRange['end']]);
        $current = $stmt->fetch();

        $stmt = $this->db->prepare("
            SELECT COALESCE(SUM(final_amount), 0) as total
            FROM appointments
            WHERE salon_id = ? AND appointment_date BETWEEN ? AND ? AND status = 'COMPLETED'
        ");
        $stmt->execute([$salonId, $previousRange['start'], $previousRange['end']]);
        $previous = $stmt->fetch();

        $trend = $this->calculateTrend($current['total'], $previous['total']);

        return [
            'value' => (float)$current['total'],
            'formatted' => '₹' . number_format($current['total'], 2),
            'trend' => $trend,
            'trend_percentage' => abs($trend),
            'count' => (int)$current['count'],
            'label' => 'Total Revenue',
            'sublabel' => 'Completed appointments'
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | APPOINTMENT STATS
    |--------------------------------------------------------------------------
    */
    private function getAppointmentStats($salonId, $currentRange, $previousRange)
    {
        $stmt = $this->db->prepare("SELECT COUNT(*) as total FROM appointments WHERE salon_id = ? AND appointment_date BETWEEN ? AND ?");
        $stmt->execute([$salonId, $currentRange['start'], $currentRange['end']]);
        $current = $stmt->fetch();

        $stmt = $this->db->prepare("SELECT COUNT(*) as total FROM appointments WHERE salon_id = ? AND appointment_date BETWEEN ? AND ?");
        $stmt->execute([$salonId, $previousRange['start'], $previousRange['end']]);
        $previous = $stmt->fetch();

        $stmt = $this->db->prepare("SELECT status, COUNT(*) as count FROM appointments WHERE salon_id = ? AND appointment_date BETWEEN ? AND ? GROUP BY status");
        $stmt->execute([$salonId, $currentRange['start'], $currentRange['end']]);
        $breakdown = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $statusCounts = ['PENDING' => 0, 'CONFIRMED' => 0, 'IN_PROGRESS' => 0, 'COMPLETED' => 0, 'CANCELLED' => 0, 'NO_SHOW' => 0];
        foreach ($breakdown as $row) {
            $statusCounts[$row['status']] = (int)$row['count'];
        }

        $trend = $this->calculateTrend($current['total'], $previous['total']);

        return [
            'value' => (int)$current['total'],
            'formatted' => number_format($current['total']),
            'trend' => $trend,
            'trend_percentage' => abs($trend),
            'label' => 'Appointments',
            'sublabel' => $this->getAppointmentSublabel($statusCounts),
            'breakdown' => $statusCounts
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | CUSTOMER STATS
    |--------------------------------------------------------------------------
    */
    private function getCustomerStats($salonId, $currentRange, $previousRange)
    {
        $stmt = $this->db->prepare("
            SELECT COUNT(DISTINCT customer_id) as total FROM appointments
            WHERE salon_id = ? AND appointment_date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
            AND status IN ('COMPLETED', 'CONFIRMED', 'PENDING')
        ");
        $stmt->execute([$salonId]);
        $active = $stmt->fetch();

        $stmt = $this->db->prepare("
            SELECT COUNT(DISTINCT a.customer_id) as new_customers FROM appointments a
            WHERE a.salon_id = ? AND a.appointment_date BETWEEN ? AND ?
            AND NOT EXISTS (
                SELECT 1 FROM appointments a2 WHERE a2.customer_id = a.customer_id
                AND a2.salon_id = a.salon_id AND a2.appointment_date < ?
            )
        ");
        $stmt->execute([$salonId, $currentRange['start'], $currentRange['end'], $currentRange['start']]);
        $newCustomers = $stmt->fetch();

        $stmt = $this->db->prepare("
            SELECT COUNT(DISTINCT a.customer_id) as new_customers FROM appointments a
            WHERE a.salon_id = ? AND a.appointment_date BETWEEN ? AND ?
            AND NOT EXISTS (
                SELECT 1 FROM appointments a2 WHERE a2.customer_id = a.customer_id
                AND a2.salon_id = a.salon_id AND a2.appointment_date < ?
            )
        ");
        $stmt->execute([$salonId, $previousRange['start'], $previousRange['end'], $previousRange['start']]);
        $prevNew = $stmt->fetch();

        $trend = $this->calculateTrend($newCustomers['new_customers'], $prevNew['new_customers']);

        return [
            'value' => (int)$active['total'],
            'formatted' => number_format($active['total']),
            'trend' => $trend,
            'trend_percentage' => abs($trend),
            'label' => 'Active Customers',
            'sublabel' => '+' . $newCustomers['new_customers'] . ' new this period',
            'new_customers' => (int)$newCustomers['new_customers']
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | STAFF STATS
    |--------------------------------------------------------------------------
    */
    private function getStaffStats($salonId, $currentRange = null, $previousRange = null)
    {
        // Get ALL staff (regardless of status) for this salon
        $stmt = $this->db->prepare("SELECT COUNT(*) as total FROM staff_info WHERE salon_id = ?");
        $stmt->execute([$salonId]);
        $allStaff = $stmt->fetch();

        // Get ACTIVE staff only
        $stmt = $this->db->prepare("SELECT COUNT(*) as active FROM staff_info WHERE salon_id = ? AND status = 'ACTIVE'");
        $stmt->execute([$salonId]);
        $active = $stmt->fetch();

        // Get INACTIVE/TERMINATED count
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as inactive FROM staff_info
            WHERE salon_id = ? AND status IN ('INACTIVE', 'TERMINATED')
        ");
        $stmt->execute([$salonId]);
        $inactive = $stmt->fetch();

        // Get staff on leave today (from ACTIVE staff)
        $today = date('Y-m-d');
        $stmt = $this->db->prepare("
            SELECT COUNT(DISTINCT si.staff_id) as on_leave FROM staff_info si
            INNER JOIN leave_requests lr ON si.staff_id = lr.staff_id
            WHERE si.salon_id = ? AND si.status = 'ACTIVE' AND lr.status = 'Approved'
            AND ? BETWEEN lr.start_date AND lr.end_date
        ");
        $stmt->execute([$salonId, $today]);
        $onLeave = $stmt->fetch();

        // Get busy staff estimate (appointments today)
        $stmt = $this->db->prepare("
            SELECT COUNT(DISTINCT a.appointment_id) as busy_appts FROM appointments a
            WHERE a.salon_id = ? AND a.appointment_date = ? AND a.status IN ('CONFIRMED', 'IN_PROGRESS')
        ");
        $stmt->execute([$salonId, $today]);
        $busyAppts = $stmt->fetch();

        // Available = Active staff - on leave - busy
        $availableFromActive = (int)$active['active'] - (int)$onLeave['on_leave'];
        $busyStaffCount = min((int)$busyAppts['busy_appts'], $availableFromActive);
        $available = max(0, $availableFromActive - $busyStaffCount);

        // ===== STAFF ACTIVE PERCENTAGE =====
        // What % of total staff records are ACTIVE (not disabled/inactive)
        $totalStaff = max(1, (int)$allStaff['total']);
        $activePercent = ((int)$active['active'] / $totalStaff) * 100;

        // ===== STAFF TREND =====
        // Track staff growth by comparing new staff hired in current vs previous period
        $currentNewStaff = $this->getNewStaffCount($salonId, $currentRange);
        $previousNewStaff = $this->getNewStaffCount($salonId, $previousRange);
        $staffTrend = $this->calculateTrend($currentNewStaff, $previousNewStaff);

        // If no new staff in either period, compare active staff count instead
        if ($currentNewStaff == 0 && $previousNewStaff == 0) {
            $prevActiveCount = $this->getPreviousActiveStaffCount($salonId, $previousRange);
            $staffTrend = $this->calculateTrend($active['active'], $prevActiveCount);
        }

        return [
            'value' => (int)$active['active'],
            'formatted' => number_format($active['active']),
            'trend' => round($staffTrend, 1),
            'trend_percentage' => abs(round($staffTrend, 1)),
            'label' => 'Active Staff',
            'sublabel' => round($activePercent, 0) . '% of total staff',
            'on_leave' => (int)$onLeave['on_leave'],
            'busy' => $busyStaffCount,
            'available' => $available,
            'total_staff' => (int)$allStaff['total'],
            'inactive_staff' => (int)$inactive['inactive'],
            'active_percent' => round($activePercent, 1),
            'prev_active_percent' => round($activePercent, 1)
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | HELPER: Get New Staff Count in Date Range
    |--------------------------------------------------------------------------
    | Count staff added (created_at) in the given date range
    |--------------------------------------------------------------------------
    */
    private function getNewStaffCount($salonId, $dateRange)
    {
        if (!$dateRange) return 0;

        $stmt = $this->db->prepare("
            SELECT COUNT(*) as new_staff FROM staff_info
            WHERE salon_id = ? AND created_at BETWEEN ? AND ?
        ");
        $stmt->execute([$salonId, $dateRange['start'], $dateRange['end']]);
        $result = $stmt->fetch();

        return (int)$result['new_staff'];
    }

    /*
    |--------------------------------------------------------------------------
    | HELPER: Get Previous Period Active Staff Count
    |--------------------------------------------------------------------------
    | Get active staff count at end of previous period
    | Since status is current state, we use total active staff as baseline
    |--------------------------------------------------------------------------
    */
    private function getPreviousActiveStaffCount($salonId, $previousRange)
    {
        if (!$previousRange) return 0;

        // Count staff who were ACTIVE at end of previous period
        // Since we don't have status history, use staff created before period end
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as active FROM staff_info
            WHERE salon_id = ? AND status = 'ACTIVE'
            AND created_at <= ?
        ");
        $stmt->execute([$salonId, $previousRange['end']]);
        $result = $stmt->fetch();

        return (int)$result['active'];
    }

    /*
    |--------------------------------------------------------------------------
    | SERVICE STATS
    |--------------------------------------------------------------------------
    */
    private function getServiceStats($salonId, $currentRange, $previousRange)
    {
        $stmt = $this->db->prepare("SELECT COUNT(*) as total FROM services WHERE salon_id = ? AND status = 'ACTIVE'");
        $stmt->execute([$salonId]);
        $active = $stmt->fetch();

        $stmt = $this->db->prepare("
            SELECT COUNT(DISTINCT asrv.service_id) as booked_count, COUNT(asrv.appointment_service_id) as total_bookings
            FROM appointment_services asrv
            INNER JOIN appointments a ON asrv.appointment_id = a.appointment_id
            WHERE a.salon_id = ? AND a.appointment_date BETWEEN ? AND ?
        ");
        $stmt->execute([$salonId, $currentRange['start'], $currentRange['end']]);
        $booked = $stmt->fetch();

        $stmt = $this->db->prepare("
            SELECT COUNT(asrv.appointment_service_id) as total_bookings FROM appointment_services asrv
            INNER JOIN appointments a ON asrv.appointment_id = a.appointment_id
            WHERE a.salon_id = ? AND a.appointment_date BETWEEN ? AND ?
        ");
        $stmt->execute([$salonId, $previousRange['start'], $previousRange['end']]);
        $prevBooked = $stmt->fetch();

        $trend = $this->calculateTrend($booked['total_bookings'], $prevBooked['total_bookings']);

        return [
            'value' => (int)$active['total'],
            'formatted' => number_format($active['total']),
            'trend' => $trend,
            'trend_percentage' => abs($trend),
            'label' => 'Active Services',
            'sublabel' => $booked['total_bookings'] . ' bookings this period',
            'booked_count' => (int)$booked['booked_count'],
            'total_bookings' => (int)$booked['total_bookings']
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | PACKAGE STATS
    |--------------------------------------------------------------------------
    */
    private function getPackageStats($salonId, $currentRange, $previousRange)
    {
        $stmt = $this->db->prepare("SELECT COUNT(*) as total FROM packages WHERE salon_id = ? AND status = 'ACTIVE'");
        $stmt->execute([$salonId]);
        $active = $stmt->fetch();

        $stmt = $this->db->prepare("
            SELECT COUNT(*) as sold_count, COALESCE(SUM(final_price), 0) as revenue
            FROM appointment_packages ap
            INNER JOIN appointments a ON ap.appointment_id = a.appointment_id
            WHERE a.salon_id = ? AND a.appointment_date BETWEEN ? AND ?
        ");
        $stmt->execute([$salonId, $currentRange['start'], $currentRange['end']]);
        $sold = $stmt->fetch();

        $stmt = $this->db->prepare("
            SELECT COUNT(*) as sold_count FROM appointment_packages ap
            INNER JOIN appointments a ON ap.appointment_id = a.appointment_id
            WHERE a.salon_id = ? AND a.appointment_date BETWEEN ? AND ?
        ");
        $stmt->execute([$salonId, $previousRange['start'], $previousRange['end']]);
        $prevSold = $stmt->fetch();

        $trend = $this->calculateTrend($sold['sold_count'], $prevSold['sold_count']);

        return [
            'value' => (int)$active['total'],
            'formatted' => number_format($active['total']),
            'trend' => $trend,
            'trend_percentage' => abs($trend),
            'label' => 'Active Packages',
            'sublabel' => $sold['sold_count'] . ' sold • ₹' . number_format($sold['revenue'], 0),
            'sold_count' => (int)$sold['sold_count'],
            'revenue' => (float)$sold['revenue']
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | COMPLETION RATE STATS
    |--------------------------------------------------------------------------
    */
    private function getCompletionRateStats($salonId, $currentRange, $previousRange)
    {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as total,
                SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled,
                SUM(CASE WHEN status = 'NO_SHOW' THEN 1 ELSE 0 END) as no_show
            FROM appointments
            WHERE salon_id = ? AND appointment_date BETWEEN ? AND ?
        ");
        $stmt->execute([$salonId, $currentRange['start'], $currentRange['end']]);
        $current = $stmt->fetch();

        $completionRate = $current['total'] > 0 ? ($current['completed'] / $current['total']) * 100 : 0;

        $stmt = $this->db->prepare("
            SELECT COUNT(*) as total, SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed
            FROM appointments WHERE salon_id = ? AND appointment_date BETWEEN ? AND ?
        ");
        $stmt->execute([$salonId, $previousRange['start'], $previousRange['end']]);
        $prev = $stmt->fetch();

        $prevRate = $prev['total'] > 0 ? ($prev['completed'] / $prev['total']) * 100 : 0;
        $trend = round($completionRate - $prevRate, 1);

        return [
            'value' => round($completionRate, 1),
            'formatted' => round($completionRate, 1) . '%',
            'trend' => $trend,
            'trend_percentage' => abs($trend),
            'label' => 'Completion Rate',
            'sublabel' => $current['completed'] . '/' . $current['total'] . ' appointments',
            'completed' => (int)$current['completed'],
            'total' => (int)$current['total'],
            'cancelled' => (int)$current['cancelled'],
            'no_show' => (int)$current['no_show']
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | PENDING STATS
    |--------------------------------------------------------------------------
    */
    private function getPendingStats($salonId, $currentRange = null, $previousRange = null)
    {
        $stmt = $this->db->prepare("SELECT COUNT(*) as pending_appts FROM appointments WHERE salon_id = ? AND status = 'PENDING'");
        $stmt->execute([$salonId]);
        $pendingAppts = $stmt->fetch();

        $stmt = $this->db->prepare("
            SELECT COUNT(*) as pending_incentives, COALESCE(SUM(incentive_amount), 0) as total_amount
            FROM incentives
            WHERE staff_id IN (SELECT staff_id FROM staff_info WHERE salon_id = ?) AND status = 'PENDING'
        ");
        $stmt->execute([$salonId]);
        $pendingIncentives = $stmt->fetch();

        $stmt = $this->db->prepare("
            SELECT COUNT(*) as low_stock FROM stock s
            INNER JOIN products p ON s.product_id = p.product_id
            WHERE p.salon_id = ? AND s.current_quantity <= s.minimum_quantity
        ");
        $stmt->execute([$salonId]);
        $lowStock = $stmt->fetch();

        $totalPending = (int)$pendingAppts['pending_appts'] + (int)$pendingIncentives['pending_incentives'] + (int)$lowStock['low_stock'];

        // ===== PENDING ACTIONS TREND =====
        // Compare total pending with previous period (lower is better)
        $currentPending = $totalPending;
        $previousPending = $this->getPreviousPending($salonId, $previousRange);
        // Invert trend: if pending decreased, that's GOOD (positive trend)
        $pendingTrend = $previousPending > 0 ? (($previousPending - $currentPending) / $previousPending) * 100 : 0;

        return [
            'value' => $totalPending,
            'formatted' => number_format($totalPending),
            'trend' => round($pendingTrend, 1),
            'trend_percentage' => abs(round($pendingTrend, 1)),
            'label' => 'Pending Actions',
            'sublabel' => 'Requires your attention',
            'breakdown' => [
                'appointments' => (int)$pendingAppts['pending_appts'],
                'incentives' => (int)$pendingIncentives['pending_incentives'],
                'low_stock' => (int)$lowStock['low_stock']
            ],
            'incentive_amount' => (float)$pendingIncentives['total_amount'],
            'previous_total' => $previousPending
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | HELPER: Get Previous Period Pending Count
    |--------------------------------------------------------------------------
    */
    private function getPreviousPending($salonId, $dateRange)
    {
        if (!$dateRange) return 0;

        // Count pending appointments from previous period
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as pending_appts FROM appointments 
            WHERE salon_id = ? AND status = 'PENDING' 
            AND created_at BETWEEN ? AND ?
        ");
        $stmt->execute([$salonId, $dateRange['start'], $dateRange['end']]);
        $pendingAppts = $stmt->fetch();

        // Count pending incentives from previous period  
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as pending_incentives
            FROM incentives
            WHERE staff_id IN (SELECT staff_id FROM staff_info WHERE salon_id = ?) 
            AND status = 'PENDING'
            AND created_at BETWEEN ? AND ?
        ");
        $stmt->execute([$salonId, $dateRange['start'], $dateRange['end']]);
        $pendingIncentives = $stmt->fetch();

        // Count low stock items (snapshot - same as current)
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as low_stock FROM stock s
            INNER JOIN products p ON s.product_id = p.product_id
            WHERE p.salon_id = ? AND s.current_quantity <= s.minimum_quantity
        ");
        $stmt->execute([$salonId]);
        $lowStock = $stmt->fetch();

        return (int)$pendingAppts['pending_appts'] + (int)$pendingIncentives['pending_incentives'] + (int)$lowStock['low_stock'];
    }

    private function calculateTrend($current, $previous)
    {
        if ($previous == 0) return $current > 0 ? 100 : 0;
        return round((($current - $previous) / $previous) * 100, 1);
    }

    private function getAppointmentSublabel($statusCounts)
    {
        $parts = [];
        if ($statusCounts['PENDING'] > 0) $parts[] = $statusCounts['PENDING'] . ' pending';
        if ($statusCounts['CONFIRMED'] > 0) $parts[] = $statusCounts['CONFIRMED'] . ' confirmed';
        if ($statusCounts['CANCELLED'] > 0) $parts[] = $statusCounts['CANCELLED'] . ' cancelled';
        return implode(' • ', $parts) ?: 'All set';
    }

    private function getPreviousDateRange($period, $currentRange)
    {
        $days = (strtotime($currentRange['end']) - strtotime($currentRange['start'])) / 86400 + 1;
        $prevEnd = date('Y-m-d', strtotime($currentRange['start']) - 1);
        $prevStart = date('Y-m-d', strtotime($prevEnd . ' -' . ($days - 1) . ' days'));
        return ['start' => $prevStart, 'end' => $prevEnd];
    }

    /*
    |--------------------------------------------------------------------------
    | 2️⃣ GET REVENUE CHART DATA
    |--------------------------------------------------------------------------
    */
    public function getRevenueChart()
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $period = $_GET['period'] ?? 'month';
        $dateRange = $this->getDateRange($period);

        try {
            $stmt = $this->db->prepare("
                SELECT
                    DATE_FORMAT(appointment_date, '%Y-%m-%d') as date,
                    COALESCE(SUM(CASE WHEN status IN ('COMPLETED', 'CONFIRMED') THEN final_amount ELSE 0 END), 0) as revenue,
                    COUNT(*) as appointment_count
                FROM appointments
                WHERE salon_id = ? AND appointment_date BETWEEN ? AND ?
                GROUP BY DATE_FORMAT(appointment_date, '%Y-%m-%d')
                ORDER BY date ASC
            ");

            $stmt->execute([$salonId, $dateRange['start'], $dateRange['end']]);
            $chartData = $stmt->fetchAll(PDO::FETCH_ASSOC);

            Response::json([
                "status" => "success",
                "data" => [
                    "period" => $period,
                    "date_range" => $dateRange,
                    "chart_data" => $chartData
                ]
            ]);

        } catch (Exception $e) {
            Response::json([
                "status" => "error",
                "message" => "Failed to fetch chart data: " . $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 3️⃣ GET APPOINTMENT TRENDS
    |--------------------------------------------------------------------------
    */
    public function getAppointmentTrends()
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $period = $_GET['period'] ?? 'month';
        $dateRange = $this->getDateRange($period);

        try {
            // Get daily appointment counts with status
            $stmt = $this->db->prepare("
                SELECT
                    DATE_FORMAT(appointment_date, '%Y-%m-%d') as date,
                    status,
                    COUNT(*) as count
                FROM appointments
                WHERE salon_id = ? AND appointment_date BETWEEN ? AND ?
                GROUP BY DATE_FORMAT(appointment_date, '%Y-%m-%d'), status
                ORDER BY date ASC, status
            ");

            $stmt->execute([$salonId, $dateRange['start'], $dateRange['end']]);
            $trends = $stmt->fetchAll(PDO::FETCH_ASSOC);

            Response::json([
                "status" => "success",
                "data" => [
                    "period" => $period,
                    "date_range" => $dateRange,
                    "trends" => $trends
                ]
            ]);

        } catch (Exception $e) {
            Response::json([
                "status" => "error",
                "message" => "Failed to fetch trends: " . $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | HELPER: Get Date Range
    |--------------------------------------------------------------------------
    */
    private function getDateRange($period, $startDate = null, $endDate = null)
    {
        // Custom date range
        if ($startDate && $endDate) {
            return ['start' => $startDate, 'end' => $endDate];
        }

        $today = date('Y-m-d');

        switch ($period) {
            case 'week':
                $start = date('Y-m-d', strtotime('monday this week'));
                return ['start' => $start, 'end' => $today];

            case 'month':
                $start = date('Y-m-01');
                return ['start' => $start, 'end' => $today];

            case 'quarter':
                $quarter = ceil(date('n') / 3);
                $startMonth = ($quarter - 1) * 3 + 1;
                $start = date('Y-' . str_pad($startMonth, 2, '0', STR_PAD_LEFT) . '-01');
                return ['start' => $start, 'end' => $today];

            case 'year':
                $start = date('Y-01-01');
                return ['start' => $start, 'end' => $today];

            default:
                $start = date('Y-m-01');
                return ['start' => $start, 'end' => $today];
        }
    }

    /*
    |--------------------------------------------------------------------------
    | HELPER: Get Top Performers (Staff Performance)
    |--------------------------------------------------------------------------
    | Note: appointment_services doesn't have staff_id column in current schema.
    | This is a placeholder that returns active staff with their basic info.
    |--------------------------------------------------------------------------
    */
    private function getTopPerformers($salonId, $dateRange)
    {
        // Since appointment_services doesn't have staff_id, we return active staff
        // with appointment counts from the appointments table directly
        $stmt = $this->db->prepare("
            SELECT 
                si.staff_id,
                si.name,
                si.specialization,
                COUNT(DISTINCT a.appointment_id) as appointments_count,
                COALESCE(SUM(a.final_amount), 0) as revenue_generated
            FROM staff_info si
            LEFT JOIN appointments a ON si.salon_id = a.salon_id 
                AND a.appointment_date BETWEEN ? AND ?
                AND a.status IN ('COMPLETED', 'CONFIRMED')
            WHERE si.salon_id = ? AND si.status = 'ACTIVE'
            GROUP BY si.staff_id, si.name, si.specialization
            ORDER BY appointments_count DESC
            LIMIT 5
        ");
        $stmt->execute([$dateRange['start'], $dateRange['end'], $salonId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /*
    |--------------------------------------------------------------------------
    | HELPER: Get Services Chart Data
    |--------------------------------------------------------------------------
    */
    private function getServicesChartData($salonId, $dateRange)
    {
        $stmt = $this->db->prepare("
            SELECT 
                s.service_id,
                s.service_name,
                COUNT(asrv.appointment_service_id) as bookings_count,
                COALESCE(SUM(asrv.final_price), 0) as net_revenue
            FROM services s
            INNER JOIN appointment_services asrv ON s.service_id = asrv.service_id
            INNER JOIN appointments a ON asrv.appointment_id = a.appointment_id
            WHERE s.salon_id = ? AND s.status = 'ACTIVE'
            AND a.appointment_date BETWEEN ? AND ?
            AND a.status IN ('COMPLETED', 'CONFIRMED')
            GROUP BY s.service_id, s.service_name
            ORDER BY net_revenue DESC
            LIMIT 5
        ");
        $stmt->execute([$salonId, $dateRange['start'], $dateRange['end']]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /*
    |--------------------------------------------------------------------------
    | HELPER: Get Status Chart Data
    |--------------------------------------------------------------------------
    */
    private function getStatusChartData($salonId, $dateRange)
    {
        $stmt = $this->db->prepare("
            SELECT status, COUNT(*) as count
            FROM appointments
            WHERE salon_id = ? AND appointment_date BETWEEN ? AND ?
            GROUP BY status
        ");
        $stmt->execute([$salonId, $dateRange['start'], $dateRange['end']]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /*
    |--------------------------------------------------------------------------
    | HELPER: Get Recent Activity
    |--------------------------------------------------------------------------
    */
    private function getRecentActivity($salonId, $limit = 6)
    {
        $stmt = $this->db->prepare("
            SELECT 
                a.appointment_id,
                a.appointment_date,
                a.start_time,
                a.final_amount,
                a.status,
                c.name as customer_name,
                GROUP_CONCAT(s.service_name SEPARATOR ', ') as services
            FROM appointments a
            INNER JOIN customers c ON a.customer_id = c.customer_id
            LEFT JOIN appointment_services asrv ON a.appointment_id = asrv.appointment_id
            LEFT JOIN services s ON asrv.service_id = s.service_id
            WHERE a.salon_id = ?
            GROUP BY a.appointment_id, a.appointment_date, a.start_time, a.final_amount, a.status, c.name
            ORDER BY a.appointment_date DESC, a.start_time DESC
            LIMIT 6
        ");
        $stmt->execute([$salonId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
