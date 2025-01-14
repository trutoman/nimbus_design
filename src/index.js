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
    document.querySelectorAll('.menu__item').forEach(item => {
        // If menu__item element has a data-page attribute, add a click event listener
        if (item.dataset.page) {
            console.log("Adding navigation in " + item + " for " + item.dataset.page);
            item.addEventListener('click', (event) => {
                event.preventDefault();
                // Obtaining path from data-page attribute
                const page = item.dataset.page;
                navigateTo(`./${page}`);
            });
        }
    });

    /**
     * Handle the browser's Back/Forward button (popstate event).
     * When the user clicks back/forward, we get the state from history
     * and load the corresponding page without pushing a new state.
     */
    window.onpopstate = function (event) {
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
    };
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
