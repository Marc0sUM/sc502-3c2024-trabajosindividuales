<?php
require 'message_log.php';
session_start();
session_unset();
session_destroy();

logError("Sesión cerrada");
header('Location: ../index.html');
