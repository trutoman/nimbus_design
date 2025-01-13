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

/**
     * navigateTo(pageName)
     * 1. Loads the content from pageName.html into #content
     * 2. Updates the browser's history (pushState) so the URL changes
     */
function navigateTo(pageName) {
    console.log(pageName);

    loadContent(pageName, true);
}

/**
 * loadContent(pageName, shouldPushState)
 * - Fetches the content from "pageName.html".
 * - If shouldPushState is true, calls history.pushState() to update the URL.
 */
function loadContent(pageName, shouldPushState) {
    // Fetch the new content
    fetch(pageName + '.html')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Could not load ${pageName}.html`);
            }
            return response.text();
        })
        .then(html => {
            // Inject content into the #content div
            document.getElementById('#main-content').innerHTML = html;

            // Update the browser history if requested
            if (shouldPushState) {
                // For example, the URL becomes: https://example.com/A
                // (Make sure your server is configured to handle these routes correctly if reloaded)
                history.pushState({ page: pageName }, '', pageName);
            }
        })
        .catch(error => {
            console.error(error);
            document.getElementById('#main-content').innerHTML =
                '<p>Oops! An error occurred loading the page.</p>';
        });
}

document.getElementById('#blog').addEventListener('click', () => {
    navigateTo('./_blog')
});

/**
 * Handle the browser's Back/Forward button (popstate event).
 * When the user clicks back/forward, we get the state from history
 * and load the corresponding page without pushing a new state.
 */
window.onpopstate = function (event) {
    // If state exists (i.e., user navigated away before), load that page
    if (event.state && event.state.page) {
        loadContent(event.state.page, false);
    } else {
        // If no state, maybe show a default or home content
        document.getElementById('#main-content').innerHTML = `
        <h1>Welcome!</h1>
        <p>Click the links above to navigate. The URL will change, but the page won’t fully reload.</p>
      `;
    }
};

/**
 * On initial load, let's check the URL path.
 * If the user loads the site at /A, for instance, we want to show A’s content right away.
 */
window.addEventListener('DOMContentLoaded', () => {
    // Grab the path excluding the leading slash. E.g. "/A" becomes "A"
    const path = window.location.pathname.substring(1);
    console.log(path);
    // If there is a path (like 'A', 'B', or 'C'), load it. Otherwise, do nothing (show default).
    if (path != 'src/index.html') {
        loadContent(path, false);
    }
});