<?php

require 'db.php';
function crearTarea($user_id, $title, $description, $due_date)
{
    global $pdo;
    try {
        $sql = "INSERT INTO tasks (user_id, title, description, due_date) values (:user_id, :title, :description, :due_date)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'user_id' => $user_id,
            'title' => $title,
            'description' => $description,
            'due_date' => $due_date
        ]);
        //devuelve el id de la tarea creada en la linea anterior
        return $pdo->lastInsertId();
    } catch (Exception $e) {
        logError("Error creando tarea: " . $e->getMessage());
        return 0;
    }
}

function crearComments($task_id, $comment)
{
    global $pdo;
    try {
        $sql = "INSERT INTO comments (task_id, comment) values (:task_id, :comment)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'task_id' => $task_id,
            'comment' => $comment
        ]);
        return $pdo->lastInsertId();
    } catch (\Throwable $th) {
        logError("Error creando comentario: " . $th->getMessage());
        return 0;
    }
}

function editarTarea($id, $title, $description, $due_date)
{
    global $pdo;
    try {
        $sql = "UPDATE tasks set title = :title, description = :description, due_date = :due_date where id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'title' => $title,
            'description' => $description,
            'due_date' => $due_date,
            'id' => $id
        ]);
        $affectedRows = $stmt->rowCount();
        return $affectedRows > 0;
    } catch (Exception $e) {
        logError($e->getMessage());
        return false;
    }
}


//obtenerTareasPorUsuari
function obtenerTareasPorUsuario($user_id)
{
    global $pdo;
    try {
        $sql = "SELECT * from tasks where user_id = :user_id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['user_id' => $user_id]);
        $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($tasks as &$task) {
            $task['comments'] = obtenerComments($task['id']);
        }
        return $tasks;
    } catch (Exception $e) {
        logError("Error al obtener tareas: " . $e->getMessage());
        return [];
    }
}

function obtenerComments($task_id)
{
    global $pdo;
    try {
        $sql = "SELECT * from comments where task_id = :task_id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['task_id' => $task_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (\Throwable $th) {
        logError("Error al obtener comentarios: " . $th->getMessage());
        return [];
    }
}

function eliminarComentario($id)
{
    global $pdo;
    try {
        $sql = "DELETE FROM comments WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->rowCount() > 0;
    } catch (Exception $e) {
        logError("Error eliminando comentario: " . $e->getMessage());
        return false;
    }
}

//Eliminar una tarea por id
function eliminarTarea($id)
{
    global $pdo;
    try {
        $sql = "delete from tasks where id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'id' => $id
        ]);
        return $stmt->rowCount() > 0; //devuelve true si se eliminó la tarea
    } catch (\Throwable $th) {
        logError("Error eliminando tarea: " . $th->getMessage());
        return false;
    }
}

$method = $_SERVER['REQUEST_METHOD'];
header('Content-Type: application/json');
function getJsonInput()
{
    return json_decode(file_get_contents('php://input'), true);
}
session_start();
if (isset($_SESSION['user_id'])) {
    //El usuario
    $user_id = $_SESSION['user_id'];
    logDebug($user_id);
    switch ($method) {
        case 'POST':
            $input = getJsonInput();
            if (isset($input['title'], $input['description'], $input['due_date'])) {
                // Crear tarea
                $id = crearTarea($user_id, $input['title'], $input['description'], $input['due_date']);
                if ($id > 0) {
                    http_response_code(201);
                    echo json_encode(["message" => "Tarea creada: ID:" . $id]);
                } else {
                    http_response_code(500);
                    echo json_encode(["error" => "Error al crear tarea"]);
                }
            } elseif (isset($input['task_id'], $input['comment'])) {
                // Crear comentario
                $commentId = crearComments($input['task_id'], $input['comment']);
                if ($commentId > 0) {
                    http_response_code(201);
                    echo json_encode(["message" => "Comentario creado", "comment_id" => $commentId]);
                } else {
                    http_response_code(500);
                    echo json_encode(["error" => "Error al crear comentario"]);
                }
            } else {
                http_response_code(400);
                echo json_encode(["error" => "Faltan datos"]);
            }
            break;
        case 'GET':
            //Obtener tareas del usuario actual
            $tareas = obtenerTareasPorUsuario($user_id);
            echo json_encode($tareas);
            break;

        case 'PUT':
            $input = getJsonInput();
            if (isset($input['title'], $input['description'], $input['due_date']) && $_GET['id']) {
                $editResult = editarTarea($_GET['id'], $input['title'], $input['description'], $input['due_date']);
                if ($editResult) {
                    http_response_code(200);
                    echo json_encode(["message" => "Tarea actualizada"]);
                } else {
                    http_response_code(404);
                    echo json_encode(["error" => "Tarea no encontrada o sin cambios"]);
                }
            } else {
                //retorna el error
                http_response_code(400);
                echo json_encode(["error" => "Faltan datos"]);
            }

            break;

        case 'DELETE':
            if (isset($_GET['id'])) {
                // Eliminar tarea
                $fueEliminado = eliminarTarea($_GET['id']);
                if ($fueEliminado) {
                    http_response_code(200);
                    echo json_encode(["message" => "Tarea eliminada"]);
                } else {
                    http_response_code(404);
                    echo json_encode(["error" => "Tarea no encontrada"]);
                }
            } elseif (isset($_GET['comment_id'])) {
                // Eliminar comentario
                $fueEliminado = eliminarComentario($_GET['comment_id']);
                if ($fueEliminado) {
                    http_response_code(200);
                    echo json_encode(["message" => "Comentario eliminado"]);
                } else {
                    http_response_code(404);
                    echo json_encode(["error" => "Comentario no encontrado"]);
                }
            } else {
                http_response_code(400);
                echo json_encode(["error" => "Faltan datos"]);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(["error" => "Método no permitido"]);
            break;
    }
} else {
    http_response_code(401);
    echo json_encode(["error" => "Acceso no autorizado"]);
}