function calcular() {
    const edad = document.getElementById("edad").value;
    const resultadoElemento = document.getElementById("resultado");
    if (edad.trim() === "") {
        alert("Por favor, rellene todos los campos");
        return;
    } else if (isNaN(edad)) {
        console.log("No es un número");
        return;
    }

    const edadNum = parseInt(edad);
  
    if (edadNum < 18) {
       resultadoElemento.innerText = "El usuario es menor de edad";
    } else{
        resultadoElemento.innerText = "El usuario es mayor de edad";  
    }


    const modal = new bootstrap.Modal(document.getElementById('resultadoModal'));
    modal.show();
}
