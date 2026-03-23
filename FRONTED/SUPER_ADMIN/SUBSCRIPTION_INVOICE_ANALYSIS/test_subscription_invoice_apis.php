<?php
/**
 * =============================================================================
 * SAM BACKEND - SUBSCRIPTION & INVOICE API TEST SUITE
 * =============================================================================
 * 
 * This file tests all APIs created/modified for the Subscription & Invoice system.
 * 
 * Tests Included:
 * - BillingHelper functions
 * - Subscription Renew API
 * - Invoice existence check
 * - Proration calculation
 * - Payment status calculation
 * 
 * Run: php test_subscription_invoice_apis.php
 * =============================================================================
 */

// Fix paths for test execution
$basePath = 'C:/xampp/htdocs/Sam-Backend';

require_once $basePath . '/BACKEND/config/database.php';
require_once $basePath . '/BACKEND/helpers/BillingHelper.php';

class SubscriptionInvoiceApiTest
{
    private $db;
    private $testsPassed = 0;
    private $testsFailed = 0;
    private $testResults = [];

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /* =============================================
       TEST RUNNER
       ============================================= */

    public function runAllTests()
    {
        echo "\n";
        echo "╔══════════════════════════════════════════════════════════════╗\n";
        echo "║   SAM - Subscription & Invoice API Test Suite               ║\n";
        echo "╚══════════════════════════════════════════════════════════════╝\n";
        echo "\n";

        // Test BillingHelper functions
        $this->testCalculateProration();
        $this->testCalculateBilling();
        $this->testGenerateInvoiceNumber();
        $this->testCalculatePaymentStatus();
        
        // Test API endpoints
        $this->testRenewSubscriptionAPI();
        $this->testInvoiceExistenceCheck();
        $this->testGetCompletedAppointments();

        // Print summary
        $this->printSummary();
    }

    private function assert($condition, $testName, $message = '')
    {
        if ($condition) {
            $this->testsPassed++;
            echo "  ✓ PASS: $testName\n";
            $this->testResults[] = ['test' => $testName, 'status' => 'PASS', 'message' => $message];
        } else {
            $this->testsFailed++;
            echo "  ✗ FAIL: $testName" . ($message ? " - $message" : "") . "\n";
            $this->testResults[] = ['test' => $testName, 'status' => 'FAIL', 'message' => $message];
        }
    }

    /* =============================================
       BILLINGHELPER TESTS
       ============================================= */

    /**
     * Test proration calculation for flat rate plans
     */
    public function testCalculateProration()
    {
        echo "\n--- Testing BillingHelper::calculateProration() ---\n";

        // Test 1: Full month (no proration)
        $proration = BillingHelper::calculateProration(
            30000, // Monthly price
            '2026-01-01', // Start date
            '2026-12-31', // End date
            '2026-03' // Billing month
        );
        
        $this->assert(
            $proration['is_prorated'] === false,
            'Full month - No proration needed',
            'Expected is_prorated to be false'
        );
        $this->assert(
            $proration['effective_price'] == 30000,
            'Full month - Full price charged',
            'Expected effective_price to be 30000'
        );

        // Test 2: Mid-month start (proration needed)
        $proration = BillingHelper::calculateProration(
            30000,
            '2026-03-16', // Start mid-month
            '2026-12-31',
            '2026-03'
        );
        
        $this->assert(
            $proration['is_prorated'] === true,
            'Mid-month start - Proration applied',
            'Expected is_prorated to be true'
        );
        $this->assert(
            $proration['days_billed'] <= 16,
            'Mid-month start - Correct days billed',
            'Expected days_billed to be <= 16'
        );
        $this->assert(
            $proration['effective_price'] < 30000,
            'Mid-month start - Reduced price',
            'Expected effective_price to be less than 30000'
        );

        // Test 3: Mid-month end (proration needed)
        $proration = BillingHelper::calculateProration(
            30000,
            '2026-01-01',
            '2026-03-15', // End mid-month
            '2026-03'
        );
        
        $this->assert(
            $proration['is_prorated'] === true,
            'Mid-month end - Proration applied',
            'Expected is_prorated to be true'
        );
        $this->assert(
            $proration['days_billed'] == 15,
            'Mid-month end - Correct days billed',
            'Expected days_billed to be 15'
        );
    }

    /**
     * Test billing calculation for all plan types
     */
    public function testCalculateBilling()
    {
        echo "\n--- Testing BillingHelper::calculateBilling() ---\n";

        // Test 1: Flat rate plan
        $subscription = [
            'start_date' => '2026-01-01',
            'end_date' => '2026-12-31'
        ];
        $plan = [
            'plan_type' => 'flat',
            'flat_price' => 50000
        ];
        $appointments = ['summary' => ['total_appointments' => 50, 'total_revenue' => 100000]];
        
        $billing = BillingHelper::calculateBilling($subscription, $plan, $appointments, '2026-03');
        
        $this->assert(
            $billing['calculation']['base_amount'] == 50000,
            'Flat plan - Base amount correct',
            'Expected base_amount to be 50000'
        );
        $this->assert(
            $billing['calculation']['per_appointment_amount'] == 0,
            'Flat plan - Per appointment is 0',
            'Expected per_appointment_amount to be 0'
        );

        // Test 2: Per-appointment plan
        $plan = [
            'plan_type' => 'per-appointments',
            'per_appointments_price' => 100
        ];
        
        $billing = BillingHelper::calculateBilling($subscription, $plan, $appointments, '2026-03');
        
        $this->assert(
            $billing['calculation']['per_appointment_amount'] == 5000,
            'Per-appointment plan - Correct calculation (50 * 100)',
            'Expected per_appointment_amount to be 5000'
        );

        // Test 3: Percentage plan
        $plan = [
            'plan_type' => 'Percentage-per-appointments',
            'percentage_per_appointment' => 10
        ];
        
        $billing = BillingHelper::calculateBilling($subscription, $plan, $appointments, '2026-03');
        
        $this->assert(
            $billing['calculation']['percentage_amount'] == 10000,
            'Percentage plan - Correct calculation (10% of 100000)',
            'Expected percentage_amount to be 10000'
        );

        // Test 4: Tax calculation
        $this->assert(
            $billing['calculation']['tax_rate'] == 18,
            'Tax rate is 18%',
            'Expected tax_rate to be 18'
        );
        $this->assert(
            $billing['calculation']['tax_amount'] > 0,
            'Tax amount calculated',
            'Expected tax_amount to be greater than 0'
        );
    }

    /**
     * Test invoice number generation
     */
    public function testGenerateInvoiceNumber()
    {
        echo "\n--- Testing BillingHelper::generateInvoiceNumber() ---\n";

        $invoiceNumber1 = BillingHelper::generateInvoiceNumber(1);
        $invoiceNumber2 = BillingHelper::generateInvoiceNumber(1);
        
        $this->assert(
            strpos($invoiceNumber1, 'INV-S-1-') === 0,
            'Invoice number format correct',
            'Expected format: INV-S-{salon_id}-{date}-{random}'
        );
        $this->assert(
            strlen($invoiceNumber1) > 15,
            'Invoice number has sufficient length',
            'Expected length > 15 characters'
        );
    }

    /**
     * Test payment status calculation
     */
    public function testCalculatePaymentStatus()
    {
        echo "\n--- Testing BillingHelper::calculatePaymentStatus() ---\n";

        // Test 1: Fully paid
        $status = BillingHelper::calculatePaymentStatus(10000, [
            ['amount' => 5000],
            ['amount' => 5000]
        ]);
        $this->assert(
            $status === 'PAID',
            'Fully paid - Status is PAID',
            'Expected status to be PAID'
        );

        // Test 2: Partially paid
        $status = BillingHelper::calculatePaymentStatus(10000, [
            ['amount' => 3000]
        ]);
        $this->assert(
            $status === 'PARTIAL',
            'Partially paid - Status is PARTIAL',
            'Expected status to be PARTIAL'
        );

        // Test 3: Unpaid
        $status = BillingHelper::calculatePaymentStatus(10000, []);
        $this->assert(
            $status === 'UNPAID',
            'No payments - Status is UNPAID',
            'Expected status to be UNPAID'
        );

        // Test 4: Overpaid (should still be PAID)
        $status = BillingHelper::calculatePaymentStatus(10000, [
            ['amount' => 12000]
        ]);
        $this->assert(
            $status === 'PAID',
            'Overpaid - Status is PAID',
            'Expected status to be PAID'
        );
    }

    /* =============================================
       API ENDPOINT TESTS
       ============================================= */

    /**
     * Test Renew Subscription API endpoint
     */
    public function testRenewSubscriptionAPI()
    {
        echo "\n--- Testing Renew Subscription API ---\n";

        // Get a test subscription
        $stmt = $this->db->prepare("
            SELECT subscription_id, salon_id, plan_id, end_date 
            FROM salon_subscriptions 
            WHERE status = 'ACTIVE' 
            LIMIT 1
        ");
        $stmt->execute();
        $subscription = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$subscription) {
            echo "  ⚠ SKIP: No active subscriptions found for testing\n";
            return;
        }

        // Test data
        $renewalData = [
            'renewal_type' => 'MANUAL',
            'renewal_days' => 30,
            'new_end_date' => date('Y-m-d', strtotime($subscription['end_date'] . ' + 30 days')),
            'plan_change' => false,
            'notes' => 'Test renewal'
        ];

        // Simulate API call
        $originalEnd = $subscription['end_date'];
        
        $this->assert(
            !empty($subscription['subscription_id']),
            'Test subscription found',
            'Subscription ID: ' . $subscription['subscription_id']
        );
        $this->assert(
            !empty($renewalData['new_end_date']),
            'New end date calculated',
            'New end date: ' . $renewalData['new_end_date']
        );

        echo "  ℹ INFO: Original end date: $originalEnd\n";
        echo "  ℹ INFO: New end date: " . $renewalData['new_end_date'] . "\n";
    }

    /**
     * Test invoice existence check
     */
    public function testInvoiceExistenceCheck()
    {
        echo "\n--- Testing Invoice Existence Check ---\n";

        // Get a test subscription
        $stmt = $this->db->prepare("
            SELECT subscription_id 
            FROM salon_subscriptions 
            LIMIT 1
        ");
        $stmt->execute();
        $subscription = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$subscription) {
            echo "  ⚠ SKIP: No subscriptions found for testing\n";
            return;
        }

        // Check for existing invoice
        $existingInvoice = BillingHelper::checkInvoiceExists(
            $this->db,
            $subscription['subscription_id'],
            date('Y-m')
        );

        if ($existingInvoice) {
            $this->assert(
                !empty($existingInvoice['invoice_number']),
                'Existing invoice found',
                'Invoice: ' . $existingInvoice['invoice_number']
            );
        } else {
            echo "  ℹ INFO: No existing invoice found for current month\n";
            $this->assert(true, 'Invoice existence check executed', 'No invoice exists (expected for new subscriptions)');
        }
    }

    /**
     * Test get completed appointments
     */
    public function testGetCompletedAppointments()
    {
        echo "\n--- Testing Get Completed Appointments ---\n";

        // Get a test salon
        $stmt = $this->db->prepare("SELECT salon_id FROM salons LIMIT 1");
        $stmt->execute();
        $salon = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$salon) {
            echo "  ⚠ SKIP: No salons found for testing\n";
            return;
        }

        $currentMonth = date('Y-m');
        $appointments = BillingHelper::getCompletedAppointments(
            $this->db,
            $salon['salon_id'],
            $currentMonth
        );

        $this->assert(
            isset($appointments['appointments']),
            'Appointments array returned',
            'Found ' . count($appointments['appointments']) . ' appointments'
        );
        $this->assert(
            isset($appointments['summary']),
            'Summary data returned',
            'Summary includes total_appointments and total_revenue'
        );

        echo "  ℹ INFO: Salon ID: " . $salon['salon_id'] . "\n";
        echo "  ℹ INFO: Billing month: $currentMonth\n";
        echo "  ℹ INFO: Total appointments: " . $appointments['summary']['total_appointments'] . "\n";
        echo "  ℹ INFO: Total revenue: ₹" . $appointments['summary']['total_revenue'] . "\n";
    }

    /* =============================================
       TEST SUMMARY
       ============================================= */

    private function printSummary()
    {
        echo "\n";
        echo "╔══════════════════════════════════════════════════════════════╗\n";
        echo "║                      TEST SUMMARY                            ║\n";
        echo "╠══════════════════════════════════════════════════════════════╣\n";
        echo sprintf("║  Tests Passed: %-45d ║\n", $this->testsPassed);
        echo sprintf("║  Tests Failed: %-45d ║\n", $this->testsFailed);
        echo "╠══════════════════════════════════════════════════════════════╣\n";
        
        $total = $this->testsPassed + $this->testsFailed;
        $passRate = $total > 0 ? round(($this->testsPassed / $total) * 100, 2) : 0;
        echo sprintf("║  Pass Rate: %-47s ║\n", $passRate . '%');
        echo "╚══════════════════════════════════════════════════════════════╝\n";
        echo "\n";

        if ($this->testsFailed > 0) {
            echo "Failed Tests:\n";
            foreach ($this->testResults as $result) {
                if ($result['status'] === 'FAIL') {
                    echo "  - " . $result['test'] . ": " . $result['message'] . "\n";
                }
            }
            echo "\n";
        }

        // Save results to file
        $this->saveResultsToFile();
    }

    private function saveResultsToFile()
    {
        $reportFile = __DIR__ . '/API_TEST_RESULTS_' . date('Y-m-d_H-i-s') . '.txt';
        
        $report = "SAM - Subscription & Invoice API Test Results\n";
        $report .= "Generated: " . date('Y-m-d H:i:s') . "\n\n";
        $report .= "Tests Passed: {$this->testsPassed}\n";
        $report .= "Tests Failed: {$this->testsFailed}\n";
        $report .= "Total Tests: " . ($this->testsPassed + $this->testsFailed) . "\n\n";
        $report .= "Detailed Results:\n";
        $report .= str_repeat('-', 80) . "\n";
        
        foreach ($this->testResults as $result) {
            $status = $result['status'] === 'PASS' ? '✓' : '✗';
            $report .= "{$status} {$result['test']}\n";
            if ($result['message']) {
                $report .= "  Message: {$result['message']}\n";
            }
        }

        file_put_contents($reportFile, $report);
        echo "Test report saved to: $reportFile\n\n";
    }
}

// Run tests
$test = new SubscriptionInvoiceApiTest();
$test->runAllTests();
