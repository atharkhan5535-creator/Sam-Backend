-- ============================================================
-- Fix staff_performance VIEW
-- Removes reference to appointment_services.staff_id (REMOVED)
-- Uses services.staff_id instead (correct inheritance)
-- ============================================================

-- Drop the broken view
DROP VIEW IF EXISTS `staff_performance`;

-- Recreate with correct JOINs
DELIMITER $$

CREATE VIEW `staff_performance` AS 
SELECT 
    si.staff_id,
    si.name,
    si.specialization,
    s.salon_name,
    COUNT(DISTINCT a.appointment_id) AS total_appointments,
    COUNT(DISTINCT aserv.appointment_service_id) AS total_services,
    COALESCE(SUM(CASE WHEN a.status = 'COMPLETED' THEN a.final_amount ELSE 0 END), 0) AS total_revenue,
    COALESCE(SUM(i.incentive_amount), 0) AS total_incentives
FROM staff_info si
JOIN salons s ON si.salon_id = s.salon_id
LEFT JOIN appointments a ON si.salon_id = a.salon_id
LEFT JOIN appointment_services aserv ON a.appointment_id = aserv.appointment_id
LEFT JOIN services svc ON aserv.service_id = svc.service_id AND svc.staff_id = si.staff_id
LEFT JOIN incentives i ON si.staff_id = i.staff_id AND i.status IN ('APPROVED','PAID')
WHERE si.status = 'ACTIVE'
GROUP BY si.staff_id, si.name, si.specialization, s.salon_name$$

DELIMITER ;

-- Verify the view works
SELECT * FROM staff_performance LIMIT 1;
