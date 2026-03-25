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
            LEFT JOIN services svc ON si.staff_id = svc.staff_id
            LEFT JOIN appointment_services asvc ON svc.service_id = asvc.service_id
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

    /*
    |--------------------------------------------------------------------------
    | 10️⃣ DASHBOARD SUMMARY (ADMIN, STAFF) - Pre-calculated stats for dashboard
    | Returns all dashboard metrics in a single API call with time period filtering
    |--------------------------------------------------------------------------
    */
    public function getDashboardSummary()
    {
        try {
            $auth = $GLOBALS['auth_user'] ?? null;
            $salonId = $auth['salon_id'] ?? null;

            if (!$salonId) {
                Response::json(["status" => "error", "message" => "Invalid salon context"], 400);
            }

            // Check for custom date range first
            $startDate = $_GET['start_date'] ?? null;
            $endDate = $_GET['end_date'] ?? null;
            $period = $_GET['period'] ?? 'today';

            // Validate date formats if provided
            if ($startDate && !DateTime::createFromFormat('Y-m-d', $startDate)) {
                Response::json(["status" => "error", "message" => "Invalid start_date format (use YYYY-MM-DD)"], 400);
            }

            if ($endDate && !DateTime::createFromFormat('Y-m-d', $endDate)) {
                Response::json(["status" => "error", "message" => "Invalid end_date format (use YYYY-MM-DD)"], 400);
            }

            if ($startDate && $endDate && $endDate < $startDate) {
                Response::json(["status" => "error", "message" => "end_date must be greater than or equal to start_date"], 400);
            }

            // Calculate date ranges for current and previous periods
            if ($startDate && $endDate) {
                // Custom date range
                $currentStart = $startDate;
                $currentEnd = $endDate;
                // Calculate previous period (same duration before start_date)
                $duration = strtotime($endDate) - strtotime($startDate);
                $previousStart = date('Y-m-d', strtotime($startDate) - $duration);
                $previousEnd = date('Y-m-d', strtotime($startDate) - 1);
                // Use 'custom' period for trend data grouping
                $period = 'custom';
            } else {
                // Preset period
                $dateRanges = $this->getDateRanges($period);
                $currentStart = $dateRanges['current_start'];
                $currentEnd = $dateRanges['current_end'];
                $previousStart = $dateRanges['previous_start'];
                $previousEnd = $dateRanges['previous_end'];
            }

            // Get current period metrics
            $stmt = $this->db->prepare("
                SELECT
                    (SELECT COUNT(*) FROM staff_info WHERE salon_id = ? AND status = 'ACTIVE') as active_staff,
                    (SELECT COUNT(*) FROM customers WHERE salon_id = ? AND status = 'ACTIVE') as active_customers,
                    (SELECT COUNT(*) FROM appointments WHERE salon_id = ? AND status = 'COMPLETED'
                        AND appointment_date BETWEEN ? AND ?) as completed_appointments,
                    (SELECT COALESCE(SUM(final_amount), 0) FROM appointments WHERE salon_id = ? AND status = 'COMPLETED'
                        AND appointment_date BETWEEN ? AND ?) as total_revenue,
                    (SELECT COUNT(*) FROM services WHERE salon_id = ? AND status = 'ACTIVE') as active_services,
                    (SELECT COUNT(*) FROM packages WHERE salon_id = ? AND status = 'ACTIVE') as active_packages,
                    (SELECT COUNT(*) FROM stock s WHERE s.salon_id = ? AND s.current_quantity < s.minimum_quantity) as low_stock_count,
                    (SELECT COUNT(*) FROM appointments WHERE salon_id = ? AND status = 'PENDING') as pending_appointments,
                    (SELECT COUNT(*) FROM appointments WHERE salon_id = ? AND status = 'CONFIRMED') as confirmed_appointments,
                    (SELECT COUNT(*) FROM appointments WHERE salon_id = ? AND status = 'CANCELLED') as cancelled_appointments,
                    (SELECT COALESCE(SUM(final_amount), 0) FROM appointments WHERE salon_id = ? AND status = 'PENDING'
                        AND appointment_date BETWEEN ? AND ?) as pending_revenue,
                    (SELECT COALESCE(SUM(final_amount), 0) FROM appointments WHERE salon_id = ? AND status = 'CONFIRMED'
                        AND appointment_date BETWEEN ? AND ?) as confirmed_revenue
            ");

            $stmt->execute([
                $salonId, $salonId, $salonId, $currentStart, $currentEnd,
                $salonId, $currentStart, $currentEnd,
                $salonId, $salonId, $salonId,
                $salonId, $salonId, $salonId,
                $salonId, $currentStart, $currentEnd,
                $salonId, $currentStart, $currentEnd
            ]);
            $currentData = $stmt->fetch(PDO::FETCH_ASSOC);

            // Get previous period metrics for trend calculation
            $stmt = $this->db->prepare("
                SELECT
                    (SELECT COUNT(*) FROM appointments WHERE salon_id = ? AND status = 'COMPLETED'
                        AND appointment_date BETWEEN ? AND ?) as completed_appointments,
                    (SELECT COALESCE(SUM(final_amount), 0) FROM appointments WHERE salon_id = ? AND status = 'COMPLETED'
                        AND appointment_date BETWEEN ? AND ?) as total_revenue,
                    (SELECT COALESCE(SUM(final_amount), 0) FROM appointments WHERE salon_id = ? AND status = 'PENDING'
                        AND appointment_date BETWEEN ? AND ?) as pending_revenue,
                    (SELECT COALESCE(SUM(final_amount), 0) FROM appointments WHERE salon_id = ? AND status = 'CONFIRMED'
                        AND appointment_date BETWEEN ? AND ?) as confirmed_revenue
            ");

            $stmt->execute([
                $salonId, $previousStart, $previousEnd,
                $salonId, $previousStart, $previousEnd,
                $salonId, $previousStart, $previousEnd,
                $salonId, $previousStart, $previousEnd
            ]);
            $previousData = $stmt->fetch(PDO::FETCH_ASSOC);

            // Calculate trends
            $trends = $this->calculateTrends($currentData, $previousData);

            // Get revenue trend data (grouped by date based on period)
            $revenueTrend = $this->getRevenueTrend($salonId, $currentStart, $currentEnd, $period);

            // Get staff performance (top 5)
            $stmt = $this->db->prepare("
                SELECT
                    s.staff_id,
                    s.name,
                    s.specialization,
                    COUNT(DISTINCT asvc.appointment_id) as appointments_count,
                    COALESCE(SUM(asvc.final_price), 0) as revenue_generated
                FROM staff_info s
                LEFT JOIN services svc ON s.staff_id = svc.staff_id
                LEFT JOIN appointment_services asvc ON svc.service_id = asvc.service_id
                LEFT JOIN appointments a ON asvc.appointment_id = a.appointment_id
                    AND a.appointment_date BETWEEN ? AND ?
                    AND a.status = 'COMPLETED'
                WHERE s.salon_id = ?
                GROUP BY s.staff_id, s.name, s.specialization
                ORDER BY revenue_generated DESC
                LIMIT 5
            ");
            $stmt->execute([$currentStart, $currentEnd, $salonId]);
            $topStaff = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Get recent appointments (last 10)
            $stmt = $this->db->prepare("
                SELECT
                    a.appointment_id,
                    a.appointment_date,
                    a.start_time,
                    a.status,
                    a.final_amount,
                    c.name as customer_name,
                    (SELECT GROUP_CONCAT(s.service_name SEPARATOR ', ')
                     FROM appointment_services asvc
                     JOIN services s ON asvc.service_id = s.service_id
                     WHERE asvc.appointment_id = a.appointment_id) as services
                FROM appointments a
                JOIN customers c ON a.customer_id = c.customer_id
                WHERE a.salon_id = ?
                ORDER BY a.appointment_date DESC, a.start_time DESC
                LIMIT 10
            ");
            $stmt->execute([$salonId]);
            $recentAppointments = $stmt->fetchAll(PDO::FETCH_ASSOC);

            Response::json([
                "status" => "success",
                "data" => [
                    "summary" => $currentData,
                    "previous_period" => $previousData,
                    "trends" => $trends,
                    "revenue_trend" => $revenueTrend,
                    "period" => $period,
                    "date_range" => [
                        "current" => ["start" => $currentStart, "end" => $currentEnd],
                        "previous" => ["start" => $previousStart, "end" => $previousEnd]
                    ],
                    "top_staff" => $topStaff,
                    "recent_appointments" => $recentAppointments
                ]
            ]);
        } catch (Exception $e) {
            error_log("getDashboardSummary error: " . $e->getMessage());
            Response::json([
                "status" => "error",
                "message" => "Failed to load dashboard: " . $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | HELPER: Get revenue trend data grouped by date
    |--------------------------------------------------------------------------
    */
    private function getRevenueTrend($salonId, $startDate, $endDate, $period)
    {
        $trend = [];

        try {
            // Group revenue by appropriate time unit based on period
            // For custom date ranges, use daily grouping
            switch ($period) {
                case 'today':
                    // Group by hour for today
                    $stmt = $this->db->prepare("
                        SELECT
                            HOUR(start_time) as hour,
                            COALESCE(SUM(final_amount), 0) as revenue
                        FROM appointments
                        WHERE salon_id = ?
                        AND appointment_date = ?
                        AND status IN ('COMPLETED', 'CONFIRMED', 'PENDING')
                        GROUP BY HOUR(start_time)
                        ORDER BY hour ASC
                    ");
                    $stmt->execute([$salonId, $startDate]);
                    $trend = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    break;

                case 'week':
                    // Group by day for this week
                    $stmt = $this->db->prepare("
                        SELECT
                            appointment_date as date,
                            COALESCE(SUM(final_amount), 0) as revenue
                        FROM appointments
                        WHERE salon_id = ?
                        AND appointment_date BETWEEN ? AND ?
                        AND status IN ('COMPLETED', 'CONFIRMED', 'PENDING')
                        GROUP BY appointment_date
                        ORDER BY appointment_date ASC
                    ");
                    $stmt->execute([$salonId, $startDate, $endDate]);
                    $trend = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    break;

                case 'month':
                    // Group by week for this month
                    $stmt = $this->db->prepare("
                        SELECT
                            CONCAT('Week ', FLOOR((DAY(appointment_date) - 1) / 7) + 1) as week,
                            MIN(appointment_date) as week_start,
                            COALESCE(SUM(final_amount), 0) as revenue
                        FROM appointments
                        WHERE salon_id = ?
                        AND appointment_date BETWEEN ? AND ?
                        AND status IN ('COMPLETED', 'CONFIRMED', 'PENDING')
                        GROUP BY WEEK(appointment_date)
                        ORDER BY week_start ASC
                    ");
                    $stmt->execute([$salonId, $startDate, $endDate]);
                    $trend = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    break;

                case 'year':
                    // Group by month for this year
                    $stmt = $this->db->prepare("
                        SELECT
                            DATE_FORMAT(appointment_date, '%Y-%m') as month,
                            COALESCE(SUM(final_amount), 0) as revenue
                        FROM appointments
                        WHERE salon_id = ?
                        AND appointment_date BETWEEN ? AND ?
                        AND status IN ('COMPLETED', 'CONFIRMED', 'PENDING')
                        GROUP BY DATE_FORMAT(appointment_date, '%Y-%m')
                        ORDER BY month ASC
                    ");
                    $stmt->execute([$salonId, $startDate, $endDate]);
                    $trend = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    break;
                
                default:
                    // For custom date ranges or unknown periods, group by day
                    $stmt = $this->db->prepare("
                        SELECT
                            appointment_date as date,
                            COALESCE(SUM(final_amount), 0) as revenue
                        FROM appointments
                        WHERE salon_id = ?
                        AND appointment_date BETWEEN ? AND ?
                        AND status IN ('COMPLETED', 'CONFIRMED', 'PENDING')
                        GROUP BY appointment_date
                        ORDER BY appointment_date ASC
                    ");
                    $stmt->execute([$salonId, $startDate, $endDate]);
                    $trend = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    break;
            }
        } catch (Exception $e) {
            // Log error but return empty array to prevent 500 errors
            error_log("getRevenueTrend error: " . $e->getMessage());
            $trend = [];
        }

        return $trend;
    }

    /*
    |--------------------------------------------------------------------------
    | 11️⃣ SUPER ADMIN DASHBOARD - Platform-wide metrics
    | Returns aggregated data for all salons
    |--------------------------------------------------------------------------
    */
    public function getSuperAdminDashboard()
    {
        $auth = $GLOBALS['auth_user'] ?? null;
        $userRole = $auth['role'] ?? null;

        if ($userRole !== 'SUPER_ADMIN') {
            Response::json(["status" => "error", "message" => "Unauthorized access"], 403);
        }

        // Get time period parameter (default: this month)
        $period = $_GET['period'] ?? 'month';
        
        // Calculate date ranges
        $dateRanges = $this->getDateRanges($period);
        $currentStart = $dateRanges['current_start'];
        $currentEnd = $dateRanges['current_end'];

        // Platform-wide totals
        $stmt = $this->db->prepare("
            SELECT
                (SELECT COUNT(*) FROM salons) as total_salons,
                (SELECT COUNT(*) FROM salons WHERE status = 1) as active_salons,
                (SELECT COUNT(*) FROM salons WHERE status = 0) as inactive_salons,
                (SELECT COUNT(*) FROM customers) as total_customers,
                (SELECT COUNT(*) FROM staff_info WHERE status = 'ACTIVE') as total_staff,
                (SELECT COUNT(*) FROM appointments WHERE appointment_date BETWEEN ? AND ?) as total_appointments,
                (SELECT COALESCE(SUM(final_amount), 0) FROM appointments 
                    WHERE appointment_date BETWEEN ? AND ? AND status = 'COMPLETED') as total_revenue,
                (SELECT COUNT(*) FROM appointments WHERE status = 'PENDING') as pending_appointments,
                (SELECT COUNT(*) FROM appointments WHERE status = 'CONFIRMED') as confirmed_appointments,
                (SELECT COUNT(*) FROM appointments WHERE status = 'COMPLETED') as completed_appointments,
                (SELECT COUNT(*) FROM appointments WHERE status = 'CANCELLED') as cancelled_appointments
        ");
        $stmt->execute([$currentStart, $currentEnd, $currentStart, $currentEnd]);
        $totals = $stmt->fetch(PDO::FETCH_ASSOC);

        // Salon comparison data
        $stmt = $this->db->prepare("
            SELECT 
                sl.salon_id,
                sl.salon_name,
                sl.city,
                sl.status,
                sp.plan_name,
                COUNT(DISTINCT c.customer_id) as customer_count,
                COUNT(DISTINCT s.staff_id) as staff_count,
                COUNT(DISTINCT a.appointment_id) as appointment_count,
                COALESCE(SUM(CASE WHEN a.status = 'COMPLETED' THEN a.final_amount ELSE 0 END), 0) as revenue
            FROM salons sl
            LEFT JOIN subscription_plans sp ON sl.subscription_plan_id = sp.plan_id
            LEFT JOIN customers c ON sl.salon_id = c.salon_id
            LEFT JOIN staff_info s ON sl.salon_id = s.salon_id AND s.status = 'ACTIVE'
            LEFT JOIN appointments a ON sl.salon_id = a.salon_id 
                AND a.appointment_date BETWEEN ? AND ?
            GROUP BY sl.salon_id, sl.salon_name, sl.city, sl.status, sp.plan_name
            ORDER BY revenue DESC
        ");
        $stmt->execute([$currentStart, $currentEnd]);
        $salonComparison = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Recent activity feed
        $stmt = $this->db->prepare("
            (SELECT 
                'NEW_SALON' as activity_type,
                salon_name as title,
                CONCAT('New salon registered in ', city) as description,
                created_at as activity_time,
                salon_id as reference_id
            FROM salons
            ORDER BY created_at DESC
            LIMIT 5)
            UNION ALL
            (SELECT 
                'SUBSCRIPTION_CHANGE' as activity_type,
                s.salon_name as title,
                CONCAT('Subscription updated') as description,
                sub.updated_at as activity_time,
                sub.subscription_id as reference_id
            FROM subscriptions sub
            JOIN salons s ON sub.salon_id = s.salon_id
            ORDER BY activity_time DESC
            LIMIT 5)
            ORDER BY activity_time DESC
            LIMIT 10
        ");
        $stmt->execute();
        $recentActivity = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Subscription plan distribution
        $stmt = $this->db->prepare("
            SELECT 
                sp.plan_name,
                sp.plan_type,
                COUNT(sl.salon_id) as salon_count,
                sp.price as plan_price
            FROM subscription_plans sp
            LEFT JOIN salons sl ON sp.plan_id = sl.subscription_plan_id AND sl.status = 1
            GROUP BY sp.plan_id, sp.plan_name, sp.plan_type, sp.price
            ORDER BY salon_count DESC
        ");
        $stmt->execute();
        $planDistribution = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Revenue trend (last 6 months)
        $stmt = $this->db->prepare("
            SELECT 
                DATE_FORMAT(appointment_date, '%Y-%m') as month,
                COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN final_amount ELSE 0 END), 0) as revenue,
                COUNT(*) as appointment_count
            FROM appointments
            WHERE appointment_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(appointment_date, '%Y-%m')
            ORDER BY month ASC
        ");
        $stmt->execute();
        $revenueTrend = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::json([
            "status" => "success",
            "data" => [
                "totals" => $totals,
                "salon_comparison" => $salonComparison,
                "recent_activity" => $recentActivity,
                "plan_distribution" => $planDistribution,
                "revenue_trend" => $revenueTrend,
                "period" => $period,
                "date_range" => ["start" => $currentStart, "end" => $currentEnd]
            ]
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | HELPER: Calculate date ranges based on period
    |--------------------------------------------------------------------------
    */
    private function getDateRanges($period)
    {
        $today = date('Y-m-d');
        $result = [];

        switch ($period) {
            case 'today':
                $result['current_start'] = $today;
                $result['current_end'] = $today;
                $yesterday = date('Y-m-d', strtotime('-1 day', strtotime($today)));
                $result['previous_start'] = $yesterday;
                $result['previous_end'] = $yesterday;
                break;

            case 'week':
                $result['current_start'] = date('Y-m-d', strtotime('monday this week'));
                $result['current_end'] = $today;
                $result['previous_start'] = date('Y-m-d', strtotime('monday last week'));
                $result['previous_end'] = date('Y-m-d', strtotime('sunday last week'));
                break;

            case 'month':
                $result['current_start'] = date('Y-m-01');
                $result['current_end'] = $today;
                $result['previous_start'] = date('Y-m-01', strtotime('-1 month'));
                $result['previous_end'] = date('Y-m-t', strtotime('-1 month'));
                break;

            case 'year':
                $result['current_start'] = date('Y-01-01');
                $result['current_end'] = $today;
                $result['previous_start'] = date('Y-01-01', strtotime('-1 year'));
                $result['previous_end'] = date('Y-12-31', strtotime('-1 year'));
                break;

            default:
                $result['current_start'] = $today;
                $result['current_end'] = $today;
                $result['previous_start'] = $today;
                $result['previous_end'] = $today;
                break;
        }

        return $result;
    }

    /*
    |--------------------------------------------------------------------------
    | HELPER: Calculate trend percentages
    |--------------------------------------------------------------------------
    */
    private function calculateTrends($current, $previous)
    {
        $trends = [];

        // Revenue trend
        $currentRevenue = floatval($current['total_revenue'] ?? 0);
        $previousRevenue = floatval($previous['total_revenue'] ?? 0);
        $trends['revenue'] = $this->calculatePercentageChange($currentRevenue, $previousRevenue);

        // Appointments trend
        $currentAppts = intval($current['completed_appointments'] ?? 0);
        $previousAppts = intval($previous['completed_appointments'] ?? 0);
        $trends['appointments'] = $this->calculatePercentageChange($currentAppts, $previousAppts);

        // Pending revenue trend
        $currentPending = floatval($current['pending_revenue'] ?? 0);
        $previousPending = floatval($previous['pending_revenue'] ?? 0);
        $trends['pending_revenue'] = $this->calculatePercentageChange($currentPending, $previousPending);

        // Confirmed revenue trend
        $currentConfirmed = floatval($current['confirmed_revenue'] ?? 0);
        $previousConfirmed = floatval($previous['confirmed_revenue'] ?? 0);
        $trends['confirmed_revenue'] = $this->calculatePercentageChange($currentConfirmed, $previousConfirmed);

        return $trends;
    }

    /*
    |--------------------------------------------------------------------------
    | HELPER: Calculate percentage change
    |--------------------------------------------------------------------------
    */
    private function calculatePercentageChange($current, $previous)
    {
        if ($previous == 0) {
            return [
                'percentage' => $current > 0 ? 100 : 0,
                'direction' => $current > 0 ? 'up' : 'stable',
                'value' => $current
            ];
        }

        $change = (($current - $previous) / $previous) * 100;
        return [
            'percentage' => round(abs($change), 2),
            'direction' => $change > 0 ? 'up' : ($change < 0 ? 'down' : 'stable'),
            'value' => round($change, 2)
        ];
    }
}
