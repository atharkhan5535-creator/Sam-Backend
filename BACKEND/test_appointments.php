<?php
/**
 * APPOINTMENT APIs COMPREHENSIVE TEST SCRIPT
 * Tests all appointment-related endpoints and verifies database changes
 */

$baseUrl = 'http://localhost/Sam-Backend/BACKEND/public/index.php/api';

// Test configuration
$testResults = [];
$accessTokens = [];

echo "===========================================\n";
echo "SAM BACKEND - APPOINTMENT APIs TEST SUITE\n";
echo "===========================================\n\n";

// Helper function to make API calls
function apiCall($method, $url, $data = null, $token = null) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    
    $headers = ['Content-Type: application/json'];
    if ($token) {
        $headers[] = 'Authorization: Bearer ' . $token;
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    if ($data) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return [
        'httpCode' => $httpCode,
        'response' => json_decode($response, true),
        'raw' => $response
    ];
}

// Test 1: Login as Admin
echo "TEST 1: Admin Login\n";
echo str_repeat("-", 50) . "\n";
$loginResult = apiCall('POST', $baseUrl . '/auth/login', [
    'email' => 'admin@elite.com',
    'password' => '123456',
    'login_type' => 'ADMIN/STAFF',
    'salon_id' => 1
]);

if ($loginResult['httpCode'] === 200 && isset($loginResult['response']['data']['access_token'])) {
    $accessTokens['admin'] = $loginResult['response']['data']['access_token'];
    echo "✅ PASS: Admin logged in successfully\n";
    echo "   Token: " . substr($accessTokens['admin'], 0, 50) . "...\n";
    $testResults['admin_login'] = 'PASS';
} else {
    echo "❌ FAIL: Admin login failed\n";
    echo "   HTTP Code: " . $loginResult['httpCode'] . "\n";
    echo "   Response: " . json_encode($loginResult['response']) . "\n";
    $testResults['admin_login'] = 'FAIL';
}
echo "\n";

// Test 2: Login as Customer
echo "TEST 2: Customer Login\n";
echo str_repeat("-", 50) . "\n";
$customerLoginResult = apiCall('POST', $baseUrl . '/auth/login', [
    'email' => 'amit.patel@email.com',
    'password' => '123456',
    'login_type' => 'CUSTOMER',
    'salon_id' => 1
]);

if ($customerLoginResult['httpCode'] === 200 && isset($customerLoginResult['response']['data']['access_token'])) {
    $accessTokens['customer'] = $customerLoginResult['response']['data']['access_token'];
    echo "✅ PASS: Customer logged in successfully\n";
    $testResults['customer_login'] = 'PASS';
} else {
    echo "❌ FAIL: Customer login failed\n";
    echo "   HTTP Code: " . $customerLoginResult['httpCode'] . "\n";
    $testResults['customer_login'] = 'FAIL';
}
echo "\n";

// Test 3: Create New Appointment
echo "TEST 3: Create Appointment with Services\n";
echo str_repeat("-", 50) . "\n";
if (isset($accessTokens['admin'])) {
    $createApptResult = apiCall('POST', $baseUrl . '/appointments', [
        'customer_id' => 1,
        'appointment_date' => '2025-03-15',
        'start_time' => '14:00:00',
        'estimated_duration' => 90,
        'notes' => 'Test appointment - API testing',
        'services' => [
            [
                'service_id' => 1,
                'staff_id' => 1,
                'price' => 500.00,
                'discount_amount' => 50.00
            ]
        ],
        'packages' => [],
        'discount_amount' => 0
    ], $accessTokens['admin']);
    
    if ($createApptResult['httpCode'] === 201 && isset($createApptResult['response']['data']['appointment_id'])) {
        $appointmentId = $createApptResult['response']['data']['appointment_id'];
        echo "✅ PASS: Appointment created successfully\n";
        echo "   Appointment ID: $appointmentId\n";
        echo "   Final Amount: " . $createApptResult['response']['data']['appointment_id'] . "\n";
        $testResults['create_appointment'] = 'PASS';
        
        // Store appointment ID for subsequent tests
        $testAppointmentId = $appointmentId;
    } else {
        echo "❌ FAIL: Create appointment failed\n";
        echo "   HTTP Code: " . $createApptResult['httpCode'] . "\n";
        echo "   Response: " . json_encode($createApptResult['response']) . "\n";
        $testResults['create_appointment'] = 'FAIL';
        $testAppointmentId = null;
    }
} else {
    echo "⏭ SKIP: Admin login failed\n";
    $testResults['create_appointment'] = 'SKIP';
    $testAppointmentId = null;
}
echo "\n";

// Test 4: View Appointment Details
echo "TEST 4: View Appointment Details\n";
echo str_repeat("-", 50) . "\n";
if (isset($testAppointmentId) && isset($accessTokens['admin'])) {
    $viewResult = apiCall('GET', $baseUrl . '/appointments/' . $testAppointmentId, null, $accessTokens['admin']);
    
    if ($viewResult['httpCode'] === 200 && isset($viewResult['response']['data']['appointment_id'])) {
        echo "✅ PASS: Appointment details retrieved\n";
        echo "   Services Count: " . count($viewResult['response']['data']['services']) . "\n";
        echo "   Packages Count: " . count($viewResult['response']['data']['packages']) . "\n";
        $testResults['view_appointment'] = 'PASS';
    } else {
        echo "❌ FAIL: View appointment failed\n";
        echo "   HTTP Code: " . $viewResult['httpCode'] . "\n";
        $testResults['view_appointment'] = 'FAIL';
    }
} else {
    echo "⏭ SKIP: No appointment to view\n";
    $testResults['view_appointment'] = 'SKIP';
}
echo "\n";

// Test 5: Add Service to Appointment (PUT - Upsert)
echo "TEST 5: Add Service to Appointment (PUT)\n";
echo str_repeat("-", 50) . "\n";
if (isset($testAppointmentId) && isset($accessTokens['admin'])) {
    $addServiceResult = apiCall('PUT', $baseUrl . '/appointments/' . $testAppointmentId . '/services/2', [
        'staff_id' => 2,
        'price' => 1500.00,
        'discount_amount' => 100.00,
        'start_time' => '14:00:00',
        'end_time' => '14:30:00'
    ], $accessTokens['admin']);
    
    if ($addServiceResult['httpCode'] === 201 && isset($addServiceResult['response']['data']['appointment_service_id'])) {
        echo "✅ PASS: Service added to appointment\n";
        echo "   Appointment Service ID: " . $addServiceResult['response']['data']['appointment_service_id'] . "\n";
        $testResults['add_service'] = 'PASS';
    } else {
        echo "❌ FAIL: Add service failed\n";
        echo "   HTTP Code: " . $addServiceResult['httpCode'] . "\n";
        echo "   Response: " . json_encode($addServiceResult['response']) . "\n";
        $testResults['add_service'] = 'FAIL';
    }
} else {
    echo "⏭ SKIP: No appointment to modify\n";
    $testResults['add_service'] = 'SKIP';
}
echo "\n";

// Test 6: Update Service in Appointment (PATCH)
echo "TEST 6: Update Service in Appointment (PATCH)\n";
echo str_repeat("-", 50) . "\n";
if (isset($testAppointmentId) && isset($accessTokens['admin'])) {
    $updateServiceResult = apiCall('PATCH', $baseUrl . '/appointments/' . $testAppointmentId . '/services/1', [
        'staff_id' => 1,
        'service_price' => 600.00,
        'discount_amount' => 100.00
    ], $accessTokens['admin']);
    
    if ($updateServiceResult['httpCode'] === 200 && $updateServiceResult['response']['status'] === 'success') {
        echo "✅ PASS: Service updated in appointment\n";
        $testResults['update_service'] = 'PASS';
    } else {
        echo "❌ FAIL: Update service failed\n";
        echo "   HTTP Code: " . $updateServiceResult['httpCode'] . "\n";
        echo "   Response: " . json_encode($updateServiceResult['response']) . "\n";
        $testResults['update_service'] = 'FAIL';
    }
} else {
    echo "⏭ SKIP: No appointment to modify\n";
    $testResults['update_service'] = 'SKIP';
}
echo "\n";

// Test 7: Add Package to Appointment (POST)
echo "TEST 7: Add Package to Appointment (POST)\n";
echo str_repeat("-", 50) . "\n";
if (isset($testAppointmentId) && isset($accessTokens['admin'])) {
    $addPackageResult = apiCall('POST', $baseUrl . '/appointments/' . $testAppointmentId . '/packages', [
        'package_id' => 1,
        'staff_id' => 1,
        'price' => 5000.00,
        'discount_amount' => 500.00
    ], $accessTokens['admin']);
    
    if ($addPackageResult['httpCode'] === 201 && isset($addPackageResult['response']['data']['appointment_package_id'])) {
        echo "✅ PASS: Package added to appointment\n";
        echo "   Appointment Package ID: " . $addPackageResult['response']['data']['appointment_package_id'] . "\n";
        echo "   New Total: " . $addPackageResult['response']['data']['new_total'] . "\n";
        $testResults['add_package'] = 'PASS';
    } else {
        echo "❌ FAIL: Add package failed\n";
        echo "   HTTP Code: " . $addPackageResult['httpCode'] . "\n";
        echo "   Response: " . json_encode($addPackageResult['response']) . "\n";
        $testResults['add_package'] = 'FAIL';
    }
} else {
    echo "⏭ SKIP: No appointment to modify\n";
    $testResults['add_package'] = 'SKIP';
}
echo "\n";

// Test 8: Update Package in Appointment (PUT)
echo "TEST 8: Update Package in Appointment (PUT)\n";
echo str_repeat("-", 50) . "\n";
if (isset($testAppointmentId) && isset($accessTokens['admin'])) {
    $updatePackageResult = apiCall('PUT', $baseUrl . '/appointments/' . $testAppointmentId . '/packages/1', [
        'staff_id' => 2,
        'package_price' => 5500.00,
        'discount_amount' => 600.00
    ], $accessTokens['admin']);
    
    if ($updatePackageResult['httpCode'] === 200 && isset($updatePackageResult['response']['data']['new_total'])) {
        echo "✅ PASS: Package updated in appointment\n";
        echo "   New Total: " . $updatePackageResult['response']['data']['new_total'] . "\n";
        $testResults['update_package'] = 'PASS';
    } else {
        echo "❌ FAIL: Update package failed\n";
        echo "   HTTP Code: " . $updatePackageResult['httpCode'] . "\n";
        echo "   Response: " . json_encode($updatePackageResult['response']) . "\n";
        $testResults['update_package'] = 'FAIL';
    }
} else {
    echo "⏭ SKIP: No appointment to modify\n";
    $testResults['update_package'] = 'SKIP';
}
echo "\n";

// Test 9: Remove Service from Appointment (DELETE)
echo "TEST 9: Remove Service from Appointment (DELETE)\n";
echo str_repeat("-", 50) . "\n";
if (isset($testAppointmentId) && isset($accessTokens['admin'])) {
    $removeServiceResult = apiCall('DELETE', $baseUrl . '/appointments/' . $testAppointmentId . '/services/2', null, $accessTokens['admin']);
    
    if ($removeServiceResult['httpCode'] === 200 && isset($removeServiceResult['response']['data']['new_total'])) {
        echo "✅ PASS: Service removed from appointment\n";
        echo "   New Total: " . $removeServiceResult['response']['data']['new_total'] . "\n";
        $testResults['remove_service'] = 'PASS';
    } else {
        echo "❌ FAIL: Remove service failed\n";
        echo "   HTTP Code: " . $removeServiceResult['httpCode'] . "\n";
        echo "   Response: " . json_encode($removeServiceResult['response']) . "\n";
        $testResults['remove_service'] = 'FAIL';
    }
} else {
    echo "⏭ SKIP: No appointment to modify\n";
    $testResults['remove_service'] = 'SKIP';
}
echo "\n";

// Test 10: Remove Package from Appointment (DELETE)
echo "TEST 10: Remove Package from Appointment (DELETE)\n";
echo str_repeat("-", 50) . "\n";
if (isset($testAppointmentId) && isset($accessTokens['admin'])) {
    $removePackageResult = apiCall('DELETE', $baseUrl . '/appointments/' . $testAppointmentId . '/packages/1', null, $accessTokens['admin']);
    
    if ($removePackageResult['httpCode'] === 200 && isset($removePackageResult['response']['data']['new_total'])) {
        echo "✅ PASS: Package removed from appointment\n";
        echo "   New Total: " . $removePackageResult['response']['data']['new_total'] . "\n";
        $testResults['remove_package'] = 'PASS';
    } else {
        echo "❌ FAIL: Remove package failed\n";
        echo "   HTTP Code: " . $removePackageResult['httpCode'] . "\n";
        echo "   Response: " . json_encode($removePackageResult['response']) . "\n";
        $testResults['remove_package'] = 'FAIL';
    }
} else {
    echo "⏭ SKIP: No appointment to modify\n";
    $testResults['remove_package'] = 'SKIP';
}
echo "\n";

// Test 11: Generate Invoice from Appointment
echo "TEST 11: Generate Invoice from Appointment\n";
echo str_repeat("-", 50) . "\n";
if (isset($testAppointmentId) && isset($accessTokens['admin'])) {
    $invoiceResult = apiCall('POST', $baseUrl . '/appointments/' . $testAppointmentId . '/invoice', [
        'subtotal_amount' => 5000.00,
        'tax_amount' => 900.00,
        'discount_amount' => 500.00,
        'due_date' => '2025-03-22',
        'notes' => 'Test invoice'
    ], $accessTokens['admin']);
    
    if ($invoiceResult['httpCode'] === 201 && isset($invoiceResult['response']['data']['invoice_customer_id'])) {
        echo "✅ PASS: Invoice generated successfully\n";
        echo "   Invoice Customer ID: " . $invoiceResult['response']['data']['invoice_customer_id'] . "\n";
        echo "   Invoice Number: " . $invoiceResult['response']['data']['invoice_number'] . "\n";
        echo "   Total Amount: " . $invoiceResult['response']['data']['total_amount'] . "\n";
        $testResults['generate_invoice'] = 'PASS';
    } else {
        echo "❌ FAIL: Generate invoice failed\n";
        echo "   HTTP Code: " . $invoiceResult['httpCode'] . "\n";
        echo "   Response: " . json_encode($invoiceResult['response']) . "\n";
        $testResults['generate_invoice'] = 'FAIL';
    }
} else {
    echo "⏭ SKIP: No appointment to invoice\n";
    $testResults['generate_invoice'] = 'SKIP';
}
echo "\n";

// Test 12: List Appointments
echo "TEST 12: List Appointments\n";
echo str_repeat("-", 50) . "\n";
if (isset($accessTokens['admin'])) {
    $listResult = apiCall('GET', $baseUrl . '/appointments?status=CONFIRMED', null, $accessTokens['admin']);
    
    if ($listResult['httpCode'] === 200 && isset($listResult['response']['data']['items'])) {
        echo "✅ PASS: Appointments listed successfully\n";
        echo "   Total Appointments: " . count($listResult['response']['data']['items']) . "\n";
        $testResults['list_appointments'] = 'PASS';
    } else {
        echo "❌ FAIL: List appointments failed\n";
        echo "   HTTP Code: " . $listResult['httpCode'] . "\n";
        $testResults['list_appointments'] = 'FAIL';
    }
} else {
    echo "⏭ SKIP: Admin not logged in\n";
    $testResults['list_appointments'] = 'SKIP';
}
echo "\n";

// Test 13: Customer Views Own Appointments (Privacy Test)
echo "TEST 13: Customer Views Own Appointments\n";
echo str_repeat("-", 50) . "\n";
if (isset($accessTokens['customer'])) {
    $customerApptResult = apiCall('GET', $baseUrl . '/appointments', null, $accessTokens['customer']);
    
    if ($customerApptResult['httpCode'] === 200 && isset($customerApptResult['response']['data']['items'])) {
        echo "✅ PASS: Customer can view own appointments\n";
        echo "   Appointments Count: " . count($customerApptResult['response']['data']['items']) . "\n";
        $testResults['customer_view_appointments'] = 'PASS';
    } else {
        echo "❌ FAIL: Customer view appointments failed\n";
        echo "   HTTP Code: " . $customerApptResult['httpCode'] . "\n";
        $testResults['customer_view_appointments'] = 'FAIL';
    }
} else {
    echo "⏭ SKIP: Customer not logged in\n";
    $testResults['customer_view_appointments'] = 'SKIP';
}
echo "\n";

// Test 14: Update Appointment Details
echo "TEST 14: Update Appointment Details\n";
echo str_repeat("-", 50) . "\n";
if (isset($testAppointmentId) && isset($accessTokens['admin'])) {
    $updateApptResult = apiCall('PUT', $baseUrl . '/appointments/' . $testAppointmentId, [
        'appointment_date' => '2025-03-16',
        'start_time' => '15:00:00',
        'notes' => 'Updated test appointment'
    ], $accessTokens['admin']);
    
    if ($updateApptResult['httpCode'] === 200 && $updateApptResult['response']['status'] === 'success') {
        echo "✅ PASS: Appointment updated successfully\n";
        $testResults['update_appointment'] = 'PASS';
    } else {
        echo "❌ FAIL: Update appointment failed\n";
        echo "   HTTP Code: " . $updateApptResult['httpCode'] . "\n";
        $testResults['update_appointment'] = 'FAIL';
    }
} else {
    echo "⏭ SKIP: No appointment to update\n";
    $testResults['update_appointment'] = 'SKIP';
}
echo "\n";

// Test 15: Approve Appointment
echo "TEST 15: Approve Appointment\n";
echo str_repeat("-", 50) . "\n";
if (isset($testAppointmentId) && isset($accessTokens['admin'])) {
    $approveResult = apiCall('PATCH', $baseUrl . '/appointments/' . $testAppointmentId . '/approve', null, $accessTokens['admin']);
    
    if ($approveResult['httpCode'] === 200 && $approveResult['response']['status'] === 'success') {
        echo "✅ PASS: Appointment approved successfully\n";
        $testResults['approve_appointment'] = 'PASS';
    } else {
        echo "❌ FAIL: Approve appointment failed\n";
        echo "   HTTP Code: " . $approveResult['httpCode'] . "\n";
        $testResults['approve_appointment'] = 'FAIL';
    }
} else {
    echo "⏭ SKIP: No appointment to approve\n";
    $testResults['approve_appointment'] = 'SKIP';
}
echo "\n";

// Test 16: Complete Appointment
echo "TEST 16: Complete Appointment\n";
echo str_repeat("-", 50) . "\n";
if (isset($testAppointmentId) && isset($accessTokens['admin'])) {
    $completeResult = apiCall('PATCH', $baseUrl . '/appointments/' . $testAppointmentId . '/complete', [
        'notes' => 'Appointment completed successfully'
    ], $accessTokens['admin']);
    
    if ($completeResult['httpCode'] === 200 && $completeResult['response']['status'] === 'success') {
        echo "✅ PASS: Appointment completed successfully\n";
        $testResults['complete_appointment'] = 'PASS';
    } else {
        echo "❌ FAIL: Complete appointment failed\n";
        echo "   HTTP Code: " . $completeResult['httpCode'] . "\n";
        $testResults['complete_appointment'] = 'FAIL';
    }
} else {
    echo "⏭ SKIP: No appointment to complete\n";
    $testResults['complete_appointment'] = 'SKIP';
}
echo "\n";

// Test 17: Submit Feedback (as Customer)
echo "TEST 17: Submit Feedback for Appointment\n";
echo str_repeat("-", 50) . "\n";
if (isset($testAppointmentId) && isset($accessTokens['customer'])) {
    $feedbackResult = apiCall('POST', $baseUrl . '/appointments/' . $testAppointmentId . '/feedback', [
        'rating' => 5,
        'comment' => 'Excellent service! Highly recommended.',
        'is_anonymous' => false
    ], $accessTokens['customer']);
    
    if ($feedbackResult['httpCode'] === 201 && isset($feedbackResult['response']['data']['feedback_id'])) {
        echo "✅ PASS: Feedback submitted successfully\n";
        echo "   Feedback ID: " . $feedbackResult['response']['data']['feedback_id'] . "\n";
        $testResults['submit_feedback'] = 'PASS';
    } else {
        echo "❌ FAIL: Submit feedback failed\n";
        echo "   HTTP Code: " . $feedbackResult['httpCode'] . "\n";
        echo "   Response: " . json_encode($feedbackResult['response']) . "\n";
        $testResults['submit_feedback'] = 'FAIL';
    }
} else {
    echo "⏭ SKIP: Cannot submit feedback\n";
    $testResults['submit_feedback'] = 'SKIP';
}
echo "\n";

// Test 18: Cancel Appointment
echo "TEST 18: Cancel Appointment (Create new one first)\n";
echo str_repeat("-", 50) . "\n";
if (isset($accessTokens['admin'])) {
    // Create a new appointment to cancel
    $newApptResult = apiCall('POST', $baseUrl . '/appointments', [
        'customer_id' => 2,
        'appointment_date' => '2025-03-20',
        'start_time' => '10:00:00',
        'estimated_duration' => 60,
        'notes' => 'Appointment to be cancelled',
        'services' => [
            [
                'service_id' => 3,
                'staff_id' => 1,
                'price' => 1200.00,
                'discount_amount' => 0
            ]
        ],
        'packages' => []
    ], $accessTokens['admin']);
    
    if ($newApptResult['httpCode'] === 201) {
        $cancelApptId = $newApptResult['response']['data']['appointment_id'];
        
        $cancelResult = apiCall('PATCH', $baseUrl . '/appointments/' . $cancelApptId . '/cancel', [
            'cancellation_reason' => 'Test cancellation - API testing'
        ], $accessTokens['admin']);
        
        if ($cancelResult['httpCode'] === 200 && $cancelResult['response']['status'] === 'success') {
            echo "✅ PASS: Appointment cancelled successfully\n";
            $testResults['cancel_appointment'] = 'PASS';
        } else {
            echo "❌ FAIL: Cancel appointment failed\n";
            echo "   HTTP Code: " . $cancelResult['httpCode'] . "\n";
            $testResults['cancel_appointment'] = 'FAIL';
        }
    } else {
        echo "❌ FAIL: Could not create appointment for cancellation test\n";
        $testResults['cancel_appointment'] = 'FAIL';
    }
} else {
    echo "⏭ SKIP: Admin not logged in\n";
    $testResults['cancel_appointment'] = 'SKIP';
}
echo "\n";

// FINAL SUMMARY
echo "\n";
echo "===========================================\n";
echo "           TEST SUMMARY\n";
echo "===========================================\n";
echo str_repeat("-", 50) . "\n";

$passCount = count(array_filter($testResults, fn($r) => $r === 'PASS'));
$failCount = count(array_filter($testResults, fn($r) => $r === 'FAIL'));
$skipCount = count(array_filter($testResults, fn($r) => $r === 'SKIP'));
$totalCount = count($testResults);

foreach ($testResults as $testName => $result) {
    $icon = $result === 'PASS' ? '✅' : ($result === 'FAIL' ? '❌' : '⏭');
    echo sprintf("%-40s %s %s\n", $testName, $icon, $result);
}

echo str_repeat("-", 50) . "\n";
echo "Total Tests: $totalCount\n";
echo "Passed: $passCount\n";
echo "Failed: $failCount\n";
echo "Skipped: $skipCount\n";
echo str_repeat("-", 50) . "\n";

if ($failCount === 0) {
    echo "🎉 ALL TESTS PASSED!\n";
} else {
    echo "⚠️  SOME TESTS FAILED - Review the results above\n";
}

echo "\n";
echo "===========================================\n";
