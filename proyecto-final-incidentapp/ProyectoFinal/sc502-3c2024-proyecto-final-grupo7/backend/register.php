<?php
require "db.php";

function userRegistry($userName, $password, $correo)
{
    try {
        global $pdo;
        $passwordHashed = password_hash($password, PASSWORD_BCRYPT);
        $sql = "INSERT INTO usuarios (userName, password_hash, correo) VALUES (:userName, :password, :correo)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['userName' => $userName, 'password' => $passwordHashed, 'correo' => $correo]);
        logDebug("Usuario registrado");
        return true;
    } catch (Exception $e) {
        logError("Error al registrar usuario: " . $e->getMessage());
        return false;
    }
}

$method = $_SERVER['REQUEST_METHOD'];
if ($method == 'POST') {

    header('Content-Type: application/json');

    if (isset($_POST['userName']) && isset($_POST['password']) && isset($_POST['correo'])) {
        $username = $_POST['userName'];
        $password = $_POST['password'];
        $correo = $_POST['correo'];
        if (userRegistry($username, $password, $correo)) {
            http_response_code(200);
            echo json_encode(['message' => 'Usuario registrado']);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Error al registrar usuario']);
        }
    } else {
        http_response_code(response_code: 400);
        echo json_encode(value: ['message' => 'Faltan datos']);
    }
} else {
    http_response_code(405);
    echo json_encode(['message' => 'Metodo no permitido']);
}