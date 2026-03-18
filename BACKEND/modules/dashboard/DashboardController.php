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
    | - Returns BOTH total and period-specific metrics
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
        $period = $_GET['period'] ?? 'month'; // week, month, quarter, year, custom
        $startDate = $_GET['start_date'] ?? null;
        $endDate = $_GET['end_date'] ?? null;

        // Calculate date range
        $dateRange = $this->getDateRange($period, $startDate, $endDate);

        try {
            // ===== TOTAL METRICS (ALL TIME) =====
            $totalStats = [];

            // Total Customers
            $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM customers WHERE salon_id = ?");
            $stmt->execute([$salonId]);
            $totalStats['customers'] = $stmt->fetch()['count'];

            // Total Services
            $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM services WHERE salon_id = ? AND status = 'ACTIVE'");
            $stmt->execute([$salonId]);
            $totalStats['services'] = $stmt->fetch()['count'];

            // Total Packages
            $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM packages WHERE salon_id = ? AND status = 'ACTIVE'");
            $stmt->execute([$salonId]);
            $totalStats['packages'] = $stmt->fetch()['count'];

            // Total Appointments
            $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM appointments WHERE salon_id = ?");
            $stmt->execute([$salonId]);
            $totalStats['appointments'] = $stmt->fetch()['count'];

            // Total Revenue (ALL TIME)
            $stmt = $this->db->prepare("
                SELECT 
                    COALESCE(SUM(final_amount), 0) as revenue,
                    COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN final_amount ELSE 0 END), 0) as completed_revenue
                FROM appointments
                WHERE salon_id = ? AND status IN ('COMPLETED', 'CONFIRMED')
            ");
            $stmt->execute([$salonId]);
            $revenue = $stmt->fetch();
            $totalStats['revenue'] = $revenue['revenue'];
            $totalStats['completed_revenue'] = $revenue['completed_revenue'];

            // ===== PERIOD-SPECIFIC METRICS =====
            $periodStats = [];

            // Customers in period (new customers)
            $stmt = $this->db->prepare("
                SELECT COUNT(DISTINCT c.customer_id) as count
                FROM customers c
                LEFT JOIN appointments a ON c.customer_id = a.customer_id
                WHERE c.salon_id = ? AND (a.appointment_date BETWEEN ? AND ? OR c.created_at BETWEEN ? AND ?)
            ");
            $stmt->execute([$salonId, $dateRange['start'], $dateRange['end'], $dateRange['start'], $dateRange['end']]);
            $periodStats['customers'] = $stmt->fetch()['count'];

            // Appointments in period
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as count
                FROM appointments
                WHERE salon_id = ? AND appointment_date BETWEEN ? AND ?
            ");
            $stmt->execute([$salonId, $dateRange['start'], $dateRange['end']]);
            $periodStats['appointments'] = $stmt->fetch()['count'];

            // Revenue in period
            $stmt = $this->db->prepare("
                SELECT 
                    COALESCE(SUM(final_amount), 0) as revenue,
                    COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN final_amount ELSE 0 END), 0) as completed_revenue
                FROM appointments
                WHERE salon_id = ? AND appointment_date BETWEEN ? AND ? AND status IN ('COMPLETED', 'CONFIRMED')
            ");
            $stmt->execute([$salonId, $dateRange['start'], $dateRange['end']]);
            $revenue = $stmt->fetch();
            $periodStats['revenue'] = $revenue['revenue'];
            $periodStats['completed_revenue'] = $revenue['completed_revenue'];

            // Services count in period (created)
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as count
                FROM services
                WHERE salon_id = ? AND created_at BETWEEN ? AND ?
            ");
            $stmt->execute([$salonId, $dateRange['start'], $dateRange['end']]);
            $periodStats['services'] = $stmt->fetch()['count'];

            // Packages count in period (created)
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as count
                FROM packages
                WHERE salon_id = ? AND created_at BETWEEN ? AND ?
            ");
            $stmt->execute([$salonId, $dateRange['start'], $dateRange['end']]);
            $periodStats['packages'] = $stmt->fetch()['count'];

            // ===== APPOINTMENT STATUS BREAKDOWN (PERIOD) =====
            $statusBreakdown = [];
            $stmt = $this->db->prepare("
                SELECT status, COUNT(*) as count
                FROM appointments
                WHERE salon_id = ? AND appointment_date BETWEEN ? AND ?
                GROUP BY status
            ");
            $stmt->execute([$salonId, $dateRange['start'], $dateRange['end']]);
            $statuses = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($statuses as $s) {
                $statusBreakdown[$s['status']] = $s['count'];
            }

            Response::json([
                "status" => "success",
                "data" => [
                    "period" => $period,
                    "date_range" => $dateRange,
                    "total" => $totalStats,
                    "period" => $periodStats,
                    "status_breakdown" => $statusBreakdown
                ]
            ]);

        } catch (Exception $e) {
            Response::json([
                "status" => "error",
                "message" => "Failed to fetch dashboard stats: " . $e->getMessage()
            ], 500);
        }
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
            // Group revenue by time unit (day/week/month)
            $groupBy = 'DAY';
            if ($period === 'week') $groupBy = 'DAY';
            elseif ($period === 'month') $groupBy = 'DAY';
            elseif ($period === 'quarter') $groupBy = 'WEEK';
            elseif ($period === 'year') $groupBy = 'MONTH';

            $stmt = $this->db->prepare("
                SELECT 
                    DATE_FORMAT(appointment_date, '%Y-%m-%d') as date,
                    COALESCE(SUM(CASE WHEN status IN ('COMPLETED', 'CONFIRMED') THEN final_amount ELSE 0 END), 0) as revenue,
                    COUNT(*) as appointment_count
                FROM appointments
                WHERE salon_id = ? AND appointment_date BETWEEN ? AND ?
                GROUP BY DATE(appointment_date)
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
                GROUP BY DATE(appointment_date), status
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
}
