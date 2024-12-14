<?php
require "message_log.php";

$host = getenv('DB_HOST') !== false ? getenv('DB_HOST') : 'localhost';
$dbname = getenv('DB_NAME') !== false ? getenv('DB_NAME') : 'todo_app';
$user = getenv('DB_USER') !== false ? getenv('DB_USER') : 'root';
$password = getenv('DB_PASSWORD') !== false ? getenv('DB_PASSWORD') : 'MARQUITOS21u.';
$port = getenv('DB_PORT') !== false ? getenv('DB_PORT') : '3305';

try{

    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname",$user,$password);
    $pdo -> setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    logDebug("DB: Conexion Exitosa");


}catch(PDOException $e){
    logError($e -> getMessage());
    die("Error de conexion: " . $e -> getMessage());
}