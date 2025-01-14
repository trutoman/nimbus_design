/* Función para alternar el menú responsive */
function myResponsiveFunction() {
    console.log("Click en el botón de menú");
    var x = document.getElementById("my-responsive-menu");
    if (x.classList.contains("responsive")) {
        x.classList.remove("responsive");
    } else {
        x.classList.add("responsive");
    }
}

/**
     * navigateTo(pageName)
     * 1. Loads the content from pageName.html into #content
     * 2. Updates the browser's history (pushState) so the URL changes
     */
function navigateTo(pageName) {
    console.log('Navigating to', pageName);
    loadContent(pageName, true);
}

/**
 * loadContent(pageName, shouldPushState)
 * - Fetches the content from "pageName.html".
 * - If shouldPushState is true, calls history.pushState() to update the URL.
 */
function loadContent(pageName, shouldPushState) {
    const pageToLoad = pageName || 'home'; // Por defecto, carga 'home'
    console.log('Loading content for', pageToLoad);
    // Fetch the new content
    fetch(pageToLoad + '.html')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Could not load ${pageToLoad}.html`);
            }
            return response.text();
        })
        .then(html => {
            // Inject content into the #content div
            document.getElementById('content').innerHTML = html;

            // Update the browser history if requested
            if (shouldPushState) {
                history.pushState({ page: pageToLoad }, '', pageName);
            }
        })
        .catch(error => {
            console.error(error);
            document.getElementById('content').innerHTML =
                '<p>Oops! An error occurred loading the page.</p>';
        });
}


async function loadComponents() {
    console.log("Loading components...");
    // We select all elements with data-page attribute
    const elements = document.querySelectorAll('[data-page]');

    // Recorremos cada elemento para hacer su respectivo fetch
    for (const elem of elements) {
        const filePath = elem.getAttribute('data-page');
        try {
            const response = await fetch(filePath);
            const data = await response.text();
            elem.innerHTML = data;
        } catch (error) {
            console.error(`Error loading ${filePath}:`, error);
        }
    }
}

function setupResponsiveMenu() {
    const toggleMenuBtn = document.getElementById("toggle-menu");
    if (toggleMenuBtn) {
        toggleMenuBtn.addEventListener("click", myResponsiveFunction);
    } else {
        console.error("No se encontró el botón #toggle-menu en el DOM.");
    }
}

function setupNavigation() {
    // 1. Selecciona el contenedor del menú (ajusta si tu HTML es distinto)
    const menuContainer = document.getElementById("navbar");
    if (!menuContainer) {
        console.error("No se encontró el contenedor de menú #my-responsive-menu en el DOM.");
        return;
    }

    // 2. Delegación de eventos: un solo listener en el contenedor
    menuContainer.addEventListener('click', (event) => {
        // Verificar si el click ocurrió en un .menu__item
        const clickedItem = event.target.closest('.menu__item');
        if (!clickedItem) return; // Si no es .menu__item, salimos

        // Si el elemento tiene data-page, gestionamos la navegación
        if (clickedItem.dataset.page) {
            event.preventDefault();
            // navigateTo recibe el nombre de la página (ej. 'about', 'home')
            // Si en tu HTML guardas data-page="about", bastará con:
            // navigateTo(clickedItem.dataset.page);
            // o si prefieres el './' delante (depende de tu estructura de rutas):
            navigateTo(`./${clickedItem.dataset.page}`);
        }
    });

    /**
     * Handle the browser's Back/Forward button (popstate event).
     * When the user clicks back/forward, we get the state from history
     * and load the corresponding page without pushing a new state.
     */
    window.addEventListener('popstate', (event) => {
        console.log('Popstate event:', event.state);
        // If state exists (i.e., user navigated away before), load that page
        if (event.state && event.state.page) {
            console.log('Loading content for', event.state.page);
            loadContent(event.state.page, false);
        } else {
            // Si no hay estado, cargar la página inicial
            history.replaceState({ page: 'home' }, '', '/src/home');
            loadContent('home', false);
        }
    });
}

function initialAddress() {

    let path = window.location.pathname.substring(1); // Obtener la ruta actual sin "/"

    if (!path || path === 'src/index.html') {
        // Redirigir a la página home y actualizar el historial
        history.replaceState({ page: 'home' }, '', '/src/home');
        loadContent('home', false);
    } else {
        // Cargar contenido dinámico según la URL
        loadContent(path, false);
    }
}

async function initApp() {
    console.log("Initialazing application...");
    await loadComponents();
    initialAddress();
    setupResponsiveMenu();
    setupNavigation();
}

// Llamamos a la función de inicio una vez que se haya cargado el DOM
document.addEventListener("DOMContentLoaded", initApp)
