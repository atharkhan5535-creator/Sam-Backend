<?php

class Request
{
    public static function getBody()
    {
        return json_decode(file_get_contents("php://input"), true);
    }

    public static function getBearerToken()
    {
        // Try getallheaders() first (Apache)
        if (function_exists('getallheaders')) {
            $headers = getallheaders();
            if (isset($headers['Authorization'])) {
                if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
                    return $matches[1];
                }
            }
        }
        
        // Fallback to $_SERVER (works with Nginx and some Apache configs)
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            if (preg_match('/Bearer\s(\S+)/', $_SERVER['HTTP_AUTHORIZATION'], $matches)) {
                return $matches[1];
            }
        }
        
        // Another fallback for CGI/FastCGI
        if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            if (preg_match('/Bearer\s(\S+)/', $_SERVER['REDIRECT_HTTP_AUTHORIZATION'], $matches)) {
                return $matches[1];
            }
        }

        return null;
    }
}
