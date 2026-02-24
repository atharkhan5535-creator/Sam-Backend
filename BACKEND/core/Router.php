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

        http_response_code(404);
        echo json_encode(['message' => 'Route not found']);
        foreach ($this->routes as $route) {
    echo $route['method'] . ' => ' . $route['path'] . "<br>";
}
exit;
    }
}



