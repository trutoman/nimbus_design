/* Función para alternar el menú responsive */
function myResponsiveFunction() {
    var x = document.getElementById("my-responsive-menu");
    if (x.classList.contains("responsive")) {
        x.classList.remove("responsive");
    } else {
        x.classList.add("responsive");
    }
}

// Agregar evento al botón
document.getElementById("toggle-menu").addEventListener("click", myResponsiveFunction);