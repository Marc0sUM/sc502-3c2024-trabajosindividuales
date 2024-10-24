const estudiantes = [
    { nombre: "Juan", apellido: "Pérez", nota: 50 },
    { nombre: "Martha", apellido: "López", nota: 99 },
    { nombre: "Homero", apellido: "Hernández", nota: 40 },
    { nombre: "Ana", apellido: "Ramírez", nota: 70 },
    { nombre: "LuiCarloss", apellido: "Gómez", nota: 100 }
];


const estudiantesDiv = document.getElementById("estudiantes");


let sumaNotas = 0;


estudiantes.forEach(estudiante => {
 
    estudiantesDiv.innerHTML += `<p>${estudiante.nombre} ${estudiante.apellido}</p>`;
    sumaNotas += estudiante.nota;
});


const promedio = sumaNotas / estudiantes.length;
const promedioDiv = document.getElementById("promedio");
promedioDiv.innerText = `Promedio de notas: ${promedio.toFixed(2)}`;
