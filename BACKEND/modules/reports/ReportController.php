<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../core/Request.php';
require_once __DIR__ . '/../../core/Response.php';

class ReportController
{
    private $db;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /*
    |--------------------------------------------------------------------------
    | 1️⃣ SALES REPORT
    | Revenue breakdown by date range
    | SUPER_ADMIN: Can view all salons or specific salon with ?salon_id=
    | ADMIN/STAFF: Can only view their own salon
    |--------------------------------------------------------------------------
    */
    public function sales()
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $userRole = $auth['role'] ?? null;
        
        // SUPER_ADMIN can view all salons or specific salon
        if ($userRole === 'SUPER_ADMIN') {
            $salonId = $_GET['salon_id'] ?? null;
        } else {
            // ADMIN/STAFF must use their own salon_id
            $salonId = $auth['salon_id'] ?? null;
        }

        $startDate = $_GET['start_date'] ?? date('Y-m-01');
        $endDate = $_GET['end_date'] ?? date('Y-m-d');

        // 1️⃣ Date Format Validation
        if (!DateTime::createFromFormat('Y-m-d', $startDate)) {
            Response::json(["status" => "error", "message" => "Invalid start_date format (use YYYY-MM-DD)"], 400);
        }

        if (!DateTime::createFromFormat('Y-m-d', $endDate)) {
            Response::json(["status" => "error", "message" => "Invalid end_date format (use YYYY-MM-DD)"], 400);
        }

        // 2️⃣ Date Range Logic Validation
        if ($endDate < $startDate) {
            Response::json(["status" => "error", "message" => "end_date must be greater than or equal to start_date"], 400);
        }

        // Build query based on role
        if ($userRole === 'SUPER_ADMIN' && !$salonId) {
            // Platform-wide report (all salons)
            $stmt = $this->db->prepare("
                SELECT
                    COALESCE(SUM(final_amount), 0) AS total_revenue,
                    COUNT(*) AS total_appointments
                FROM appointments
                WHERE appointment_date BETWEEN ? AND ?
                AND status IN ('COMPLETED', 'IN_PROGRESS')
            ");
            $stmt->execute([$startDate, $endDate]);
            
            // Revenue by service (all salons)
            $stmt = $this->db->prepare("
                SELECT s.service_name,
                       COUNT(*) AS count,
                       COALESCE(SUM(asvc.final_price), 0) AS revenue
                FROM appointment_services asvc
                INNER JOIN appointments a ON asvc.appointment_id = a.appointment_id
                INNER JOIN services s ON asvc.service_id = s.service_id
                WHERE a.appointment_date BETWEEN ? AND ?
                AND a.status IN ('COMPLETED', 'IN_PROGRESS')
                GROUP BY s.service_id, s.service_name
                ORDER BY revenue DESC
            ");
            $stmt->execute([$startDate, $endDate]);
            $byService = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Revenue by package (all salons)
            $stmt = $this->db->prepare("
                SELECT p.package_name,
                       COUNT(*) AS count,
                       COALESCE(SUM(ap.final_price), 0) AS revenue
                FROM appointment_packages ap
                INNER JOIN appointments a ON ap.appointment_id = a.appointment_id
                INNER JOIN packages p ON ap.package_id = p.package_id
                WHERE a.appointment_date BETWEEN ? AND ?
                AND a.status IN ('COMPLETED', 'IN_PROGRESS')
                GROUP BY p.package_id, p.package_name
                ORDER BY revenue DESC
            ");
            $stmt->execute([$startDate, $endDate]);
            $byPackage = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } else {
            // Specific salon report
            if (!$salonId) {
                Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
            }
            
            $stmt = $this->db->prepare("
                SELECT
                    COALESCE(SUM(final_amount), 0) AS total_revenue,
                    COUNT(*) AS total_appointments
                FROM appointments
                WHERE salon_id = ?
                AND appointment_date BETWEEN ? AND ?
                AND status IN ('COMPLETED', 'IN_PROGRESS')
            ");
            $stmt->execute([$salonId, $startDate, $endDate]);
            $summary = $stmt->fetch(PDO::FETCH_ASSOC);

            // Revenue by service
            $stmt = $this->db->prepare("
                SELECT s.service_name,
                       COUNT(*) AS count,
                       COALESCE(SUM(asvc.final_price), 0) AS revenue
                FROM appointment_services asvc
                INNER JOIN appointments a ON asvc.appointment_id = a.appointment_id
                INNER JOIN services s ON asvc.service_id = s.service_id
                WHERE a.salon_id = ?
                AND a.appointment_date BETWEEN ? AND ?
                AND a.status IN ('COMPLETED', 'IN_PROGRESS')
                GROUP BY s.service_id, s.service_name
                ORDER BY revenue DESC
            ");
            $stmt->execute([$salonId, $startDate, $endDate]);
            $byService = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Revenue by package
            $stmt = $this->db->prepare("
                SELECT p.package_name,
                       COUNT(*) AS count,
                       COALESCE(SUM(ap.final_price), 0) AS revenue
                FROM appointment_packages ap
                INNER JOIN appointments a ON ap.appointment_id = a.appointment_id
                INNER JOIN packages p ON ap.package_id = p.package_id
                WHERE a.salon_id = ?
                AND a.appointment_date BETWEEN ? AND ?
                AND a.status IN ('COMPLETED', 'IN_PROGRESS')
                GROUP BY p.package_id, p.package_name
                ORDER BY revenue DESC
            ");
            $stmt->execute([$salonId, $startDate, $endDate]);
            $byPackage = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        Response::json([
            "status" => "success",
            "data" => [
                "summary" => $summary ?? ['total_revenue' => 0, 'total_appointments' => 0],
                "by_service" => $byService ?? [],
                "by_package" => $byPackage ?? [],
                "period" => [
                    "start_date" => $startDate,
                    "end_date" => $endDate
                ],
                "scope" => $salonId ? "salon" : "platform"
            ]
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 2️⃣ APPOINTMENT REPORT
    | Appointment statistics and status breakdown
    | SUPER_ADMIN: Can view all salons or specific salon with ?salon_id=
    | ADMIN/STAFF: Can only view their own salon
    |--------------------------------------------------------------------------
    */
    public function appointments()
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $userRole = $auth['role'] ?? null;
        
        // SUPER_ADMIN can view all salons or specific salon
        if ($userRole === 'SUPER_ADMIN') {
            $salonId = $_GET['salon_id'] ?? null;
        } else {
            // ADMIN/STAFF must use their own salon_id
            $salonId = $auth['salon_id'] ?? null;
        }

        $startDate = $_GET['start_date'] ?? date('Y-m-01');
        $endDate = $_GET['end_date'] ?? date('Y-m-d');

        // 1️⃣ Date Format Validation
        if (!DateTime::createFromFormat('Y-m-d', $startDate)) {
            Response::json(["status" => "error", "message" => "Invalid start_date format (use YYYY-MM-DD)"], 400);
        }

        if (!DateTime::createFromFormat('Y-m-d', $endDate)) {
            Response::json(["status" => "error", "message" => "Invalid end_date format (use YYYY-MM-DD)"], 400);
        }

        // 2️⃣ Date Range Logic Validation
        if ($endDate < $startDate) {
            Response::json(["status" => "error", "message" => "end_date must be greater than or equal to start_date"], 400);
        }

        // Build query based on role
        if ($userRole === 'SUPER_ADMIN' && !$salonId) {
            // Platform-wide report (all salons)
            $stmt = $this->db->prepare("
                SELECT status, COUNT(*) AS count
                FROM appointments
                WHERE appointment_date BETWEEN ? AND ?
                GROUP BY status
            ");
            $stmt->execute([$startDate, $endDate]);
            $statusBreakdown = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $stmt = $this->db->prepare("
                SELECT
                    COUNT(*) AS total_appointments,
                    COALESCE(SUM(final_amount), 0) AS total_revenue,
                    COALESCE(SUM(discount_amount), 0) AS total_discounts
                FROM appointments
                WHERE appointment_date BETWEEN ? AND ?
            ");
            $stmt->execute([$startDate, $endDate]);
            $summary = $stmt->fetch(PDO::FETCH_ASSOC);
        } else {
            // Specific salon report
            if (!$salonId) {
                Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
            }
            
            $stmt = $this->db->prepare("
                SELECT status, COUNT(*) AS count
                FROM appointments
                WHERE salon_id = ?
                AND appointment_date BETWEEN ? AND ?
                GROUP BY status
            ");
            $stmt->execute([$salonId, $startDate, $endDate]);
            $statusBreakdown = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $stmt = $this->db->prepare("
                SELECT
                    COUNT(*) AS total_appointments,
                    COALESCE(SUM(final_amount), 0) AS total_revenue,
                    COALESCE(SUM(discount_amount), 0) AS total_discounts
                FROM appointments
                WHERE salon_id = ?
                AND appointment_date BETWEEN ? AND ?
            ");
            $stmt->execute([$salonId, $startDate, $endDate]);
            $summary = $stmt->fetch(PDO::FETCH_ASSOC);
        }

        Response::json([
            "status" => "success",
            "data" => [
                "summary" => $summary ?? ['total_appointments' => 0, 'total_revenue' => 0, 'total_discounts' => 0],
                "status_breakdown" => $statusBreakdown ?? [],
                "period" => [
                    "start_date" => $startDate,
                    "end_date" => $endDate
                ],
                "scope" => $salonId ? "salon" : "platform"
            ]
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 3️⃣ STAFF PERFORMANCE REPORT
    | Staff performance with incentives and appointments handled
    |--------------------------------------------------------------------------
    */
    public function staffPerformance()
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $startDate = $_GET['start_date'] ?? date('Y-m-01');
        $endDate = $_GET['end_date'] ?? date('Y-m-d');

        // 1️⃣ Date Format Validation
        if (!DateTime::createFromFormat('Y-m-d', $startDate)) {
            Response::json(["status" => "error", "message" => "Invalid start_date format (use YYYY-MM-DD)"], 400);
        }

        if (!DateTime::createFromFormat('Y-m-d', $endDate)) {
            Response::json(["status" => "error", "message" => "Invalid end_date format (use YYYY-MM-DD)"], 400);
        }

        // 2️⃣ Date Range Logic Validation
        if ($endDate < $startDate) {
            Response::json(["status" => "error", "message" => "end_date must be greater than or equal to start_date"], 400);
        }

        // Staff performance with appointments count and incentives
        $stmt = $this->db->prepare("
            SELECT 
                si.staff_id,
                si.name,
                si.specialization,
                COUNT(DISTINCT asvc.appointment_id) AS appointments_handled,
                COALESCE(SUM(asvc.final_price), 0) AS revenue_generated,
                COALESCE((
                    SELECT SUM(i.incentive_amount)
                    FROM incentives i
                    WHERE i.staff_id = si.staff_id
                    AND i.created_at BETWEEN ? AND ?
                ), 0) AS total_incentives,
                COALESCE((
                    SELECT SUM(ip.payout_amount)
                    FROM incentive_payouts ip
                    WHERE ip.staff_id = si.staff_id
                    AND ip.payout_date BETWEEN ? AND ?
                ), 0) AS total_payouts
            FROM staff_info si
            LEFT JOIN appointment_services asvc ON si.staff_id = asvc.staff_id
            LEFT JOIN appointments a ON asvc.appointment_id = a.appointment_id
                AND a.appointment_date BETWEEN ? AND ?
            WHERE si.salon_id = ?
            GROUP BY si.staff_id, si.name, si.specialization
            ORDER BY revenue_generated DESC
        ");
        $stmt->execute([$startDate, $endDate, $startDate, $endDate, $startDate, $endDate, $salonId]);
        $staffPerformance = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::json([
            "status" => "success",
            "data" => [
                "staff" => $staffPerformance,
                "period" => [
                    "start_date" => $startDate,
                    "end_date" => $endDate
                ]
            ]
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 4️⃣ SERVICE-WISE REVENUE REPORT
    | SUPER_ADMIN: Can view all salons or specific salon with ?salon_id=
    | ADMIN/STAFF: Can only view their own salon
    |--------------------------------------------------------------------------
    */
    public function services()
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $userRole = $auth['role'] ?? null;
        
        // SUPER_ADMIN can view all salons or specific salon
        if ($userRole === 'SUPER_ADMIN') {
            $salonId = $_GET['salon_id'] ?? null;
        } else {
            // ADMIN/STAFF must use their own salon_id
            $salonId = $auth['salon_id'] ?? null;
        }

        $startDate = $_GET['start_date'] ?? date('Y-m-01');
        $endDate = $_GET['end_date'] ?? date('Y-m-d');

        // 1️⃣ Date Format Validation
        if (!DateTime::createFromFormat('Y-m-d', $startDate)) {
            Response::json(["status" => "error", "message" => "Invalid start_date format (use YYYY-MM-DD)"], 400);
        }

        if (!DateTime::createFromFormat('Y-m-d', $endDate)) {
            Response::json(["status" => "error", "message" => "Invalid end_date format (use YYYY-MM-DD)"], 400);
        }

        // 2️⃣ Date Range Logic Validation
        if ($endDate < $startDate) {
            Response::json(["status" => "error", "message" => "end_date must be greater than or equal to start_date"], 400);
        }

        // Build query based on role
        if ($userRole === 'SUPER_ADMIN' && !$salonId) {
            // Platform-wide report (all salons)
            $stmt = $this->db->prepare("
                SELECT
                    s.service_id,
                    s.service_name,
                    s.price AS standard_price,
                    COUNT(*) AS times_booked,
                    COALESCE(SUM(asvc.service_price), 0) AS gross_revenue,
                    COALESCE(SUM(asvc.discount_amount), 0) AS total_discounts,
                    COALESCE(SUM(asvc.final_price), 0) AS net_revenue
                FROM appointment_services asvc
                INNER JOIN appointments a ON asvc.appointment_id = a.appointment_id
                INNER JOIN services s ON asvc.service_id = s.service_id
                WHERE a.appointment_date BETWEEN ? AND ?
                AND a.status IN ('COMPLETED', 'IN_PROGRESS')
                GROUP BY s.service_id, s.service_name, s.price
                ORDER BY net_revenue DESC
            ");
            $stmt->execute([$startDate, $endDate]);
            $services = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } else {
            // Specific salon report
            if (!$salonId) {
                Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
            }
            
            $stmt = $this->db->prepare("
                SELECT
                    s.service_id,
                    s.service_name,
                    s.price AS standard_price,
                    COUNT(*) AS times_booked,
                    COALESCE(SUM(asvc.service_price), 0) AS gross_revenue,
                    COALESCE(SUM(asvc.discount_amount), 0) AS total_discounts,
                    COALESCE(SUM(asvc.final_price), 0) AS net_revenue
                FROM appointment_services asvc
                INNER JOIN appointments a ON asvc.appointment_id = a.appointment_id
                INNER JOIN services s ON asvc.service_id = s.service_id
                WHERE a.salon_id = ?
                AND a.appointment_date BETWEEN ? AND ?
                AND a.status IN ('COMPLETED', 'IN_PROGRESS')
                GROUP BY s.service_id, s.service_name, s.price
                ORDER BY net_revenue DESC
            ");
            $stmt->execute([$salonId, $startDate, $endDate]);
            $services = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        Response::json([
            "status" => "success",
            "data" => [
                "services" => $services ?? [],
                "period" => [
                    "start_date" => $startDate,
                    "end_date" => $endDate
                ],
                "scope" => $salonId ? "salon" : "platform"
            ]
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 5️⃣ PACKAGE-WISE REVENUE REPORT
    | SUPER_ADMIN: Can view all salons or specific salon with ?salon_id=
    | ADMIN/STAFF: Can only view their own salon
    |--------------------------------------------------------------------------
    */
    public function packages()
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $userRole = $auth['role'] ?? null;
        
        // SUPER_ADMIN can view all salons or specific salon
        if ($userRole === 'SUPER_ADMIN') {
            $salonId = $_GET['salon_id'] ?? null;
        } else {
            // ADMIN/STAFF must use their own salon_id
            $salonId = $auth['salon_id'] ?? null;
        }

        $startDate = $_GET['start_date'] ?? date('Y-m-01');
        $endDate = $_GET['end_date'] ?? date('Y-m-d');

        // 1️⃣ Date Format Validation
        if (!DateTime::createFromFormat('Y-m-d', $startDate)) {
            Response::json(["status" => "error", "message" => "Invalid start_date format (use YYYY-MM-DD)"], 400);
        }

        if (!DateTime::createFromFormat('Y-m-d', $endDate)) {
            Response::json(["status" => "error", "message" => "Invalid end_date format (use YYYY-MM-DD)"], 400);
        }

        // 2️⃣ Date Range Logic Validation
        if ($endDate < $startDate) {
            Response::json(["status" => "error", "message" => "end_date must be greater than or equal to start_date"], 400);
        }

        // Build query based on role
        if ($userRole === 'SUPER_ADMIN' && !$salonId) {
            // Platform-wide report (all salons)
            $stmt = $this->db->prepare("
                SELECT
                    p.package_id,
                    p.package_name,
                    p.total_price AS standard_price,
                    p.validity_days,
                    COUNT(*) AS times_booked,
                    COALESCE(SUM(ap.package_price), 0) AS gross_revenue,
                    COALESCE(SUM(ap.discount_amount), 0) AS total_discounts,
                    COALESCE(SUM(ap.final_price), 0) AS net_revenue
                FROM appointment_packages ap
                INNER JOIN appointments a ON ap.appointment_id = a.appointment_id
                INNER JOIN packages p ON ap.package_id = p.package_id
                WHERE a.appointment_date BETWEEN ? AND ?
                AND a.status IN ('COMPLETED', 'IN_PROGRESS')
                GROUP BY p.package_id, p.package_name, p.total_price, p.validity_days
                ORDER BY net_revenue DESC
            ");
            $stmt->execute([$startDate, $endDate]);
            $packages = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } else {
            // Specific salon report
            if (!$salonId) {
                Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
            }
            
            $stmt = $this->db->prepare("
                SELECT
                    p.package_id,
                    p.package_name,
                    p.total_price AS standard_price,
                    p.validity_days,
                    COUNT(*) AS times_booked,
                    COALESCE(SUM(ap.package_price), 0) AS gross_revenue,
                    COALESCE(SUM(ap.discount_amount), 0) AS total_discounts,
                    COALESCE(SUM(ap.final_price), 0) AS net_revenue
                FROM appointment_packages ap
                INNER JOIN appointments a ON ap.appointment_id = a.appointment_id
                INNER JOIN packages p ON ap.package_id = p.package_id
                WHERE a.salon_id = ?
                AND a.appointment_date BETWEEN ? AND ?
                AND a.status IN ('COMPLETED', 'IN_PROGRESS')
                GROUP BY p.package_id, p.package_name, p.total_price, p.validity_days
                ORDER BY net_revenue DESC
            ");
            $stmt->execute([$salonId, $startDate, $endDate]);
            $packages = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        Response::json([
            "status" => "success",
            "data" => [
                "packages" => $packages ?? [],
                "period" => [
                    "start_date" => $startDate,
                    "end_date" => $endDate
                ],
                "scope" => $salonId ? "salon" : "platform"
            ]
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 6️⃣ CUSTOMER VISIT REPORT
    |--------------------------------------------------------------------------
    */
    public function customers()
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $startDate = $_GET['start_date'] ?? date('Y-m-01');
        $endDate = $_GET['end_date'] ?? date('Y-m-d');

        // 1️⃣ Date Format Validation
        if (!DateTime::createFromFormat('Y-m-d', $startDate)) {
            Response::json(["status" => "error", "message" => "Invalid start_date format (use YYYY-MM-DD)"], 400);
        }

        if (!DateTime::createFromFormat('Y-m-d', $endDate)) {
            Response::json(["status" => "error", "message" => "Invalid end_date format (use YYYY-MM-DD)"], 400);
        }

        // 2️⃣ Date Range Logic Validation
        if ($endDate < $startDate) {
            Response::json(["status" => "error", "message" => "end_date must be greater than or equal to start_date"], 400);
        }

        // Customer visit statistics
        $stmt = $this->db->prepare("
            SELECT 
                c.customer_id,
                c.name,
                c.phone,
                c.email,
                COUNT(a.appointment_id) AS visits_in_period,
                c.total_visits AS lifetime_visits,
                COALESCE(SUM(a.final_amount), 0) AS revenue_in_period,
                MAX(a.appointment_date) AS last_visit
            FROM customers c
            LEFT JOIN appointments a ON c.customer_id = a.customer_id
                AND a.appointment_date BETWEEN ? AND ?
                AND a.status IN ('COMPLETED', 'IN_PROGRESS')
            WHERE c.salon_id = ?
            GROUP BY c.customer_id, c.name, c.phone, c.email, c.total_visits
            HAVING visits_in_period > 0
            ORDER BY revenue_in_period DESC
        ");
        $stmt->execute([$startDate, $endDate, $salonId]);
        $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Summary
        $stmt = $this->db->prepare("
            SELECT 
                COUNT(DISTINCT c.customer_id) AS total_customers_visited,
                COALESCE(SUM(a.final_amount), 0) AS total_revenue
            FROM customers c
            INNER JOIN appointments a ON c.customer_id = a.customer_id
            WHERE c.salon_id = ?
            AND a.appointment_date BETWEEN ? AND ?
            AND a.status IN ('COMPLETED', 'IN_PROGRESS')
        ");
        $stmt->execute([$salonId, $startDate, $endDate]);
        $summary = $stmt->fetch(PDO::FETCH_ASSOC);

        Response::json([
            "status" => "success",
            "data" => [
                "summary" => $summary,
                "customers" => $customers,
                "period" => [
                    "start_date" => $startDate,
                    "end_date" => $endDate
                ]
            ]
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 7️⃣ INVENTORY USAGE REPORT
    |--------------------------------------------------------------------------
    */
    public function inventory()
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $startDate = $_GET['start_date'] ?? date('Y-m-01');
        $endDate = $_GET['end_date'] ?? date('Y-m-d');

        // 1️⃣ Date Format Validation
        if (!DateTime::createFromFormat('Y-m-d', $startDate)) {
            Response::json(["status" => "error", "message" => "Invalid start_date format (use YYYY-MM-DD)"], 400);
        }

        if (!DateTime::createFromFormat('Y-m-d', $endDate)) {
            Response::json(["status" => "error", "message" => "Invalid end_date format (use YYYY-MM-DD)"], 400);
        }

        // 2️⃣ Date Range Logic Validation
        if ($endDate < $startDate) {
            Response::json(["status" => "error", "message" => "end_date must be greater than or equal to start_date"], 400);
        }

        // Stock transactions summary
        $stmt = $this->db->prepare("
            SELECT 
                p.product_id,
                p.product_name,
                p.brand,
                p.category,
                s.current_quantity,
                s.minimum_quantity,
                s.maximum_quantity,
                COALESCE((
                    SELECT SUM(st.quantity)
                    FROM stock_transactions st
                    WHERE st.stock_id = s.stock_id
                    AND st.transaction_type = 'IN'
                    AND st.created_at BETWEEN ? AND ?
                ), 0) AS total_in,
                COALESCE((
                    SELECT SUM(st.quantity)
                    FROM stock_transactions st
                    WHERE st.stock_id = s.stock_id
                    AND st.transaction_type = 'OUT'
                    AND st.created_at BETWEEN ? AND ?
                ), 0) AS total_out,
                CASE
                    WHEN s.current_quantity <= s.minimum_quantity THEN 'LOW'
                    WHEN s.current_quantity >= s.maximum_quantity THEN 'OVERSTOCKED'
                    ELSE 'OK'
                END AS stock_status
            FROM products p
            INNER JOIN stock s ON p.product_id = s.product_id
            WHERE p.salon_id = ?
            ORDER BY p.product_name
        ");
        $stmt->execute([$startDate, $endDate, $startDate, $endDate, $salonId]);
        $inventory = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Low stock count
        $lowStockCount = count(array_filter($inventory, fn($item) => $item['stock_status'] === 'LOW'));

        Response::json([
            "status" => "success",
            "data" => [
                "inventory" => $inventory,
                "low_stock_count" => $lowStockCount,
                "period" => [
                    "start_date" => $startDate,
                    "end_date" => $endDate
                ]
            ]
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 8️⃣ INCENTIVE PAYOUT REPORT
    |--------------------------------------------------------------------------
    */
    public function incentives()
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $salonId = $auth['salon_id'] ?? null;

        if (!$salonId) {
            Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
        }

        $startDate = $_GET['start_date'] ?? date('Y-m-01');
        $endDate = $_GET['end_date'] ?? date('Y-m-d');

        // 1️⃣ Date Format Validation
        if (!DateTime::createFromFormat('Y-m-d', $startDate)) {
            Response::json(["status" => "error", "message" => "Invalid start_date format (use YYYY-MM-DD)"], 400);
        }

        if (!DateTime::createFromFormat('Y-m-d', $endDate)) {
            Response::json(["status" => "error", "message" => "Invalid end_date format (use YYYY-MM-DD)"], 400);
        }

        // 2️⃣ Date Range Logic Validation
        if ($endDate < $startDate) {
            Response::json(["status" => "error", "message" => "end_date must be greater than or equal to start_date"], 400);
        }

        // Incentive summary by staff
        $stmt = $this->db->prepare("
            SELECT 
                si.staff_id,
                si.name,
                COUNT(i.incentive_id) AS incentives_count,
                COALESCE(SUM(i.incentive_amount), 0) AS total_incentives,
                COALESCE((
                    SELECT SUM(ip.payout_amount)
                    FROM incentive_payouts ip
                    WHERE ip.staff_id = si.staff_id
                ), 0) AS total_paid,
                COALESCE(SUM(i.incentive_amount), 0) - COALESCE((
                    SELECT SUM(ip.payout_amount)
                    FROM incentive_payouts ip
                    WHERE ip.staff_id = si.staff_id
                ), 0) AS outstanding
            FROM staff_info si
            LEFT JOIN incentives i ON si.staff_id = i.staff_id
                AND i.created_at BETWEEN ? AND ?
            WHERE si.salon_id = ?
            GROUP BY si.staff_id, si.name
            HAVING incentives_count > 0
            ORDER BY total_incentives DESC
        ");
        $stmt->execute([$startDate, $endDate, $salonId]);
        $staffIncentives = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Summary
        $stmt = $this->db->prepare("
            SELECT 
                COUNT(*) AS total_incentives,
                COALESCE(SUM(incentive_amount), 0) AS total_amount,
                COALESCE(SUM(CASE WHEN status = 'PAID' THEN incentive_amount ELSE 0 END), 0) AS total_paid,
                COALESCE(SUM(CASE WHEN status != 'PAID' THEN incentive_amount ELSE 0 END), 0) AS total_outstanding
            FROM incentives
            WHERE staff_id IN (SELECT staff_id FROM staff_info WHERE salon_id = ?)
            AND created_at BETWEEN ? AND ?
        ");
        $stmt->execute([$salonId, $startDate, $endDate]);
        $summary = $stmt->fetch(PDO::FETCH_ASSOC);

        Response::json([
            "status" => "success",
            "data" => [
                "summary" => $summary,
                "by_staff" => $staffIncentives,
                "period" => [
                    "start_date" => $startDate,
                    "end_date" => $endDate
                ]
            ]
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | 9️⃣ TAX REPORT (GST)
    | SUPER_ADMIN: Can view all salons or specific salon with ?salon_id=
    | ADMIN/STAFF: Can only view their own salon
    |--------------------------------------------------------------------------
    */
    public function tax()
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $userRole = $auth['role'] ?? null;
        
        // SUPER_ADMIN can view all salons or specific salon
        if ($userRole === 'SUPER_ADMIN') {
            $salonId = $_GET['salon_id'] ?? null;
        } else {
            // ADMIN/STAFF must use their own salon_id
            $salonId = $auth['salon_id'] ?? null;
        }

        $startDate = $_GET['start_date'] ?? date('Y-m-01');
        $endDate = $_GET['end_date'] ?? date('Y-m-d');
        $taxRate = $_GET['tax_rate'] ?? 18; // Default 18% GST

        // 1️⃣ Date Format Validation
        if (!DateTime::createFromFormat('Y-m-d', $startDate)) {
            Response::json(["status" => "error", "message" => "Invalid start_date format (use YYYY-MM-DD)"], 400);
        }

        if (!DateTime::createFromFormat('Y-m-d', $endDate)) {
            Response::json(["status" => "error", "message" => "Invalid end_date format (use YYYY-MM-DD)"], 400);
        }

        // 2️⃣ Date Range Logic Validation
        if ($endDate < $startDate) {
            Response::json(["status" => "error", "message" => "end_date must be greater than or equal to start_date"], 400);
        }

        // 3️⃣ Tax Rate Range Validation (0-100%)
        if ($taxRate < 0 || $taxRate > 100) {
            Response::json(["status" => "error", "message" => "Tax rate must be between 0 and 100"], 400);
        }

        // Build query based on role
        if ($userRole === 'SUPER_ADMIN' && !$salonId) {
            // Platform-wide report (all salons)
            $stmt = $this->db->prepare("
                SELECT
                    COALESCE(SUM(final_amount), 0) AS taxable_revenue,
                    COALESCE(SUM(final_amount), 0) * (? / 100) AS tax_amount,
                    COUNT(*) AS taxable_transactions
                FROM appointments
                WHERE appointment_date BETWEEN ? AND ?
                AND status IN ('COMPLETED', 'IN_PROGRESS')
            ");
            $stmt->execute([$taxRate, $startDate, $endDate]);
            $appointmentTax = $stmt->fetch(PDO::FETCH_ASSOC);

            $stmt = $this->db->prepare("
                SELECT
                    COALESCE(SUM(amount), 0) AS taxable_revenue,
                    COALESCE(SUM(tax_amount), 0) AS tax_amount,
                    COUNT(*) AS taxable_transactions
                FROM invoice_salon
                WHERE invoice_date BETWEEN ? AND ?
            ");
            $stmt->execute([$startDate, $endDate]);
            $subscriptionTax = $stmt->fetch(PDO::FETCH_ASSOC);
        } else {
            // Specific salon report
            if (!$salonId) {
                Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
            }
            
            $stmt = $this->db->prepare("
                SELECT
                    COALESCE(SUM(final_amount), 0) AS taxable_revenue,
                    COALESCE(SUM(final_amount), 0) * (? / 100) AS tax_amount,
                    COUNT(*) AS taxable_transactions
                FROM appointments
                WHERE salon_id = ?
                AND appointment_date BETWEEN ? AND ?
                AND status IN ('COMPLETED', 'IN_PROGRESS')
            ");
            $stmt->execute([$taxRate, $salonId, $startDate, $endDate]);
            $appointmentTax = $stmt->fetch(PDO::FETCH_ASSOC);

            $stmt = $this->db->prepare("
                SELECT
                    COALESCE(SUM(amount), 0) AS taxable_revenue,
                    COALESCE(SUM(tax_amount), 0) AS tax_amount,
                    COUNT(*) AS taxable_transactions
                FROM invoice_salon
                WHERE salon_id = ?
                AND invoice_date BETWEEN ? AND ?
            ");
            $stmt->execute([$salonId, $startDate, $endDate]);
            $subscriptionTax = $stmt->fetch(PDO::FETCH_ASSOC);
        }

        $totalTaxableRevenue = ($appointmentTax['taxable_revenue'] ?? 0) + ($subscriptionTax['taxable_revenue'] ?? 0);
        $totalTax = ($appointmentTax['tax_amount'] ?? 0) + ($subscriptionTax['tax_amount'] ?? 0);

        Response::json([
            "status" => "success",
            "data" => [
                "tax_rate" => (float) $taxRate,
                "summary" => [
                    "total_taxable_revenue" => $totalTaxableRevenue,
                    "total_tax_amount" => $totalTax,
                    "total_transactions" => ($appointmentTax['taxable_transactions'] ?? 0) + ($subscriptionTax['taxable_transactions'] ?? 0)
                ],
                "breakdown" => [
                    "appointments" => $appointmentTax ?? [],
                    "subscriptions" => $subscriptionTax ?? []
                ],
                "period" => [
                    "start_date" => $startDate,
                    "end_date" => $endDate
                ],
                "scope" => $salonId ? "salon" : "platform"
            ]
        ]);
    }
}
