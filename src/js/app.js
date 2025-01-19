import { pageMap } from './config.js';

// We load content for a requested page while at same time
// we manage the history state.
function loadContent(pageToLoad, shouldPushState) {
    console.log("Loading content from:", pageToLoad);

    if (shouldPushState) {
        // If current page is already at history we avoid to duplicate it
        if (history.state && history.state.page === pageToLoad) {
            console.log("We are already at " + pageToLoad);
            return;
        }
    }

    // Fetch the new content for a page
    const realPageToLoad = pageMap[pageToLoad] || pageToLoad;
    fetch(realPageToLoad)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Could not load ${realPageToLoad}`);
            }
            return response.text();
        })
        .then(html => {
            // Inject content into the #content div
            document.getElementById('content').innerHTML = html;

            // Update the browser history if requested
            if (shouldPushState) {
                history.pushState({ page: pageToLoad }, '', pageToLoad);
            }
        })
        .catch(error => {
            console.error(error);
            document.getElementById('content').innerHTML =
                '<p>Oops! An error occurred loading the page.</p>';
        });
}

// This function load content in every existing element with 'data-page' attribute
async function loadComponents() {
    console.log("Loading components...");
    // We select all elements with data-page attribute
    const elements = document.querySelectorAll('[data-page]');
    // We search for the corresponding page and load content on element
    for (const elem of elements) {
        const filePath = elem.getAttribute('data-page');
        const realPageToLoad = pageMap[filePath] || filePath;
        try {
            const response = await fetch(realPageToLoad);
            const data = await response.text();
            elem.innerHTML = data;
        } catch (error) {
            console.error(`Error loading ${realPageToLoad}:`, error);
        }
    }
}

function setupResponsiveMenu() {
    // Function to alternate responsive menu
    function myResponsiveFunction() {
        console.log("Click in menu button");
        let x = document.getElementById("my-responsive-menu");
        if (x.classList.contains("responsive")) {
            x.classList.remove("responsive");
        } else {
            x.classList.add("responsive");
        }
    }
    // This block will add responsive function to click event on toggle-menu element
    const toggleMenuBtn = document.getElementById("toggle-menu");
    if (toggleMenuBtn) {
        toggleMenuBtn.addEventListener("click", myResponsiveFunction);
    } else {
        console.error("We did NOT find #toggle-menu inside DOM.");
    }
}

// Function to set between color modes
function setModes() {
    const userTheme = localStorage.getItem('theme');
    if (userTheme) {
        document.body.classList.add(userTheme);
    } else {
        document.body.classList.add('dark-theme');
    }
    const toggleButton = document.getElementById('theme-toggle');

    toggleButton.addEventListener('click', () => {
        if (document.body.classList.contains('light-theme')) {
            document.body.classList.remove('light-theme');
            document.body.classList.add('dark-theme');
            toggleButton.textContent = 'light_mode';
        } else {
            document.body.classList.remove('dark-theme');
            document.body.classList.add('light-theme');
            toggleButton.textContent = 'dark_mode';
        }
    });
}

function handleMenuClick(event, menuContainer) {
    // Verify if click happens on ".menu__list-element" elements
    const clickedItem = event.target.closest('.menu__list-element');
    console.log("selected item:", clickedItem);
    if (!clickedItem) return; // If not menu__item clicked we exit

    // We reassign active class only when element clicked is has a menu__item
    if (clickedItem.hasAttribute('data-page')) {
        const elements = menuContainer.querySelectorAll('.menu__list-element');
        for (const elem of elements) {
            elem.classList.remove("menu__list-element-active");
        }
        // If menu__item has a page defined we load content
        if (clickedItem.dataset.page) {
            event.preventDefault();
            loadContent(`${clickedItem.dataset.page}`, true);
            clickedItem.classList.add("menu__list-element-active");
        }
        else {
            console.log("selected item:" + clickedItem + " has no data-page attribute");
        }
    }
}

// We configure navigation im navbar elements
function setupNavigation() {
    // We select the container of menu with elements managing events
    const menuContainer = document.getElementById("navbar");
    if (!menuContainer) {
        console.error("We did NOT find container menu #my-responsive-menu inside DOM.");
        return;
    }
    // Events delegation: we create an unique listener on container
    // (in place of create a listener for every menu elements)
    menuContainer.addEventListener('click', (event) => handleMenuClick(event, menuContainer));

    // Handle the browser's Back/Forward button (popstate event).
    // When the user clicks back/forward, we get the state from history
    // and load the corresponding page without pushing a new state.
    window.addEventListener('popstate', (event) => {
        console.log('Popstate event:', event);
        // If state exists (i.e., user navigated away before), load that page
        if (event.state && event.state.page) {
            console.log('Loading content for', event.state.page);
            loadContent(event.state.page, false);
        } else {
            // if no state we load main page
            console.log('popstate null');
            //history.replaceState({ page: 'home' }, '', 'home');
            //loadContent('home', false);
        }
    });
}

// We manipulate the first load of index.html to redirect to home page
function initialAddress() {
    let path = window.location.pathname;
    if (!path || path === '/public/index.html') {
        // Redirect to main page and load history
        history.replaceState({ page: 'home' }, '', 'home');
        loadContent('home', false);
    } else {
        // We load content of url
        loadContent(path, false);
    }
}

// This function unifies all the procedures at init
async function initApp() {
    console.log("Initialazing application...");
    await loadComponents();
    initialAddress();
    setupResponsiveMenu();
    setModes();
    setupNavigation();
}

// Call initApp function just when DOM has already being loaded
document.addEventListener("DOMContentLoaded", initApp)
