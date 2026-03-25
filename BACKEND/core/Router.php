<?php

class Router
{
    private $routes = [];

    public function register($method, $path, $handler, $middlewares = [])
    {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'handler' => $handler,
            'middlewares' => $middlewares
        ];
    }

    public function resolve($method, $uri)
    {
        foreach ($this->routes as $route) {

            if ($route['method'] !== $method) {
                continue;
            }

            // Convert {param} to regex
            $pattern = preg_replace('/\{[^}]+\}/', '([^/]+)', $route['path']);
            $pattern = "#^" . $pattern . "$#";

            if (preg_match($pattern, $uri, $matches)) {

                array_shift($matches); // remove full match

                foreach ($route['middlewares'] as $middleware) {
                    call_user_func($middleware);
                }

                return call_user_func_array($route['handler'], $matches);
            }
        }

        // Clear any output buffers before sending error response
        if (ob_get_level()) {
            ob_end_clean();
        }
        
        http_response_code(404);
        header("Content-Type: application/json");
        echo json_encode(['status' => 'error', 'message' => 'Route not found: ' . $method . ' ' . $uri]);
        exit;
    }
}



