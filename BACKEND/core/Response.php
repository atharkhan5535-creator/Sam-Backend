<?php

class Response
{
    public static function json($data, $status = 200)
    {
        // Clear any existing output buffers to prevent corrupted JSON
        if (ob_get_level()) {
            ob_end_clean();
        }
        
        http_response_code($status);
        header("Content-Type: application/json");
        
        // Ensure no whitespace before JSON
        $json = json_encode($data);
        
        // Send JSON response
        echo $json;
        exit;
    }
}
