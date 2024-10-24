function calcular() {
    const salario = document.getElementById("salario").value;

    if (salario.trim() === "") {
        alert("Por favor, rellene todos los campos");
        return;
    } else if (isNaN(salario)) {
        alert("No es un número o no esta usando el formato solicitado");
        return;
    }

    const salarioNumerico = parseFloat(salario);
    const deduccion = salarioNumerico * 0.1067;
    let calcSalario = salarioNumerico - deduccion;

    if (salarioNumerico > 4445000) {
        calcSalario = calcSalario * 0.75;  
    } else if (salarioNumerico > 2223000) {
        calcSalario = calcSalario * 0.80;  
    } else if (salarioNumerico > 1267000) {
        calcSalario = calcSalario * 0.85;  
    } else if (salarioNumerico > 863000) {
        calcSalario = calcSalario * 0.90;  
    }

    
    const resultadoElemento = document.getElementById("resultado");
    resultadoElemento.innerText = `Cargas Sociales: ${calcSalario} (después de deducciones)`;

    const modal = new bootstrap.Modal(document.getElementById('resultadoModal'));
    modal.show();
}
