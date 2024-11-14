<?php

$transacciones = [];

function registrarTransaccion($id, $descripcion, $monto){
    global $transacciones;
   
    $transaccion = [
        "id" => $id,
        "descripcion" => $descripcion,
        "monto" => $monto
    ];
    array_push($transacciones, $transaccion);
    echo "Transaccion registrada";
}

function estadoCuenta(){
    global $transacciones;
    $totalTransacciones = 0;
    foreach ($transacciones as $transaccion){
        $totalTransacciones += $transaccion["monto"]; 
        echo "Transaccion: ",$transaccion["descripcion"],PHP_EOL," Monto: ",$transaccion["monto"], PHP_EOL;
    }
    $totalCashback = $totalTransacciones * 0.01;
    $totalInteres = $totalTransacciones * 0.26;
    echo "El monto total de las transacciones es: ", $totalTransacciones, PHP_EOL;
    echo "El cashback es: ", $totalCashback, PHP_EOL;
    echo "El interés es: ", $totalInteres, PHP_EOL;
}


registrarTransaccion(1, "Compra de zapatos", 100);
echo PHP_EOL;
registrarTransaccion(2, "Compra de ropa", 50);
echo PHP_EOL;
registrarTransaccion(3, "Compra de comida", 200);
echo PHP_EOL;
registrarTransaccion(4, "Compra de tecnologia", 300);
echo PHP_EOL;

estadoCuenta();