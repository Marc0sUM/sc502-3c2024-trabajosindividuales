<?php
session_start();
require "db.php";


function login($userName, $password)
{
    try {
        global $pdo;
        $sql = "SELECT * FROM usuarios where userName = :userName AND enable = TRUE";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['userName' => $userName]);

        //Obtener datos del usuario
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password_hash'])) {
            $_SESSION['user_id'] = $user['id_usuario'];
            return true;
        }
        return false;
    } catch (Exception $e) {
        logError($e->getMessage());
        return false;
    }
}

//Guardar metodo HTTP
$method = $_SERVER['REQUEST_METHOD'];
if ($method == 'POST') {

    header('Content-Type: application/json');
    //Obtener datos del request
    if (isset($_POST['userName']) && isset($_POST['password'])) {
        $username = $_POST['userName'];
        $password = $_POST['password'];
        if (login($username, $password)) {
            http_response_code(200);
            echo json_encode(['message' => 'Login exitoso']);
        } else {
            http_response_code(401);
            echo json_encode(['message' => 'Credenciales incorrectas']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['message' => 'Faltan datos']);
    }
} else {
    http_response_code(405);
    echo json_encode(['message' => 'Metodo no permitido']);
}