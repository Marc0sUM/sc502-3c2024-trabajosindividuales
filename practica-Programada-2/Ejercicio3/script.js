const boton = document.getElementById("cambiarContenido");
const parrafo = document.getElementById("parrafo");

function cambiarTexto() {
    parrafo.innerHTML = "No hiciste caso ahora me debes $1.";
}

boton.addEventListener("click", cambiarTexto);
