// Define the number of countries to display and the increment step.
const INITIAL_DISPLAY_COUNT = 12;
let displayCount = INITIAL_DISPLAY_COUNT;
const displayIncrement = 6;

/**
 * Normalize and format an array or object of names (currencies, languages).
 * Returns a comma-separated string of names.
 * - Accepts arrays of strings or objects
 * - Accepts objects where values are strings or objects with a `name` property
 */
function getFormattedNames(collection) {
    if (!collection) return "";

    // Handle arrays like [{ name: 'English' }, 'Spanish']
    if (Array.isArray(collection)) {
        return collection
            .map((item) => {
                if (!item && item !== 0) return "";
                if (typeof item === "string") return item;
                if (typeof item === "object")
                    return item.name || item.title || "";
                return String(item);
            })
            .filter(Boolean)
            .join(", ");
    }

    // Handle objects like { eng: 'English', spa: 'Spanish' } or
    // { USD: { name: 'United States dollar' } }
    if (typeof collection === "object") {
        return Object.values(collection)
            .map((val) => {
                if (!val && val !== 0) return "";
                if (typeof val === "string") return val;
                if (typeof val === "object")
                    return val.name || val.common || "";
                return String(val);
            })
            .filter(Boolean)
            .join(", ");
    }

    return String(collection);
}

// Build a query string from a country object and navigate to the Details page
function countryCardHandler(country) {
    if (!country) return;

    const name = country.name && country.name.common ? country.name.common : "";
    const capital = Array.isArray(country.capital)
        ? country.capital.join(", ")
        : country.capital || "";
    const population = country.population ? String(country.population) : "";
    const region = country.region || "";
    const subregion = country.subregion || "";
    const currencies = getFormattedNames(country.currencies);
    const languages = getFormattedNames(country.languages);
    const flag =
        (country.flags && (country.flags.png || country.flags.svg)) || "";

    const params = [
        `name=${encodeURIComponent(name)}`,
        `capital=${encodeURIComponent(capital)}`,
        `population=${encodeURIComponent(population)}`,
        `region=${encodeURIComponent(region)}`,
        `subregion=${encodeURIComponent(subregion)}`,
        `currencies=${encodeURIComponent(currencies)}`,
        `languages=${encodeURIComponent(languages)}`,
        `flag=${encodeURIComponent(flag)}`,
    ].join("&");

    window.location.href = `details.html?${params}`;
}

// Filter the data based on the search term, region, and minimum population
function filterData(searchTerm, region, minPopulation) {
    // Validate the user input.
    if (typeof searchTerm !== "string") {
        searchTerm = "";
    }

    if (typeof region !== "string" || region === "All Regions") {
        region = "";
    }

    if (
        minPopulation === "" ||
        minPopulation === null ||
        minPopulation === undefined
    ) {
        minPopulation = null;
    }

    if (typeof minPopulation === "string") {
        minPopulation = Number(minPopulation);
    }

    if (
        typeof minPopulation !== "number" ||
        Number.isNaN(minPopulation) ||
        minPopulation < 0
    ) {
        minPopulation = null;
    }

    if (!Array.isArray(data)) {
        return [];
    }

    return data.filter((country) => {
        const countryName =
            country.name && country.name.common
                ? country.name.common.toLowerCase()
                : "";

        const searchLower = searchTerm.trim().toLowerCase();
        const regionLower = region.trim().toLowerCase();
        const countryRegion = (country.region || "").toLowerCase();

        if (searchLower && !countryName.includes(searchLower)) {
            return false;
        }

        if (regionLower) {
            if (countryRegion !== regionLower) {
                return false;
            }
        }

        if (typeof minPopulation === "number") {
            if ((country.population || 0) < minPopulation) {
                return false;
            }
        }

        return true;
    });
}

// Apply the filters and update the displayed country cards
function applyFilters(resetDisplayCount = true) {
    if (resetDisplayCount) {
        displayCount = INITIAL_DISPLAY_COUNT;
    }

    const searchInput = document.getElementById("search-input");
    const regionSelect = document.getElementById("region-select");
    const minPopulationInput = document.getElementById("min-population");

    const searchTerm = searchInput ? searchInput.value : "";
    const region = regionSelect ? regionSelect.value : "";
    const minPopulation = minPopulationInput ? minPopulationInput.value : "";
    const searchError = document.getElementById("search-error");
    const populationError = document.getElementById("population-error");

    // Pattern validation: disallow special characters outside letters, spaces, hyphens and apostrophes
    const invalidNameRegex = /[^A-Za-zÀ-ž'\- ]/;
    if (searchTerm && invalidNameRegex.test(searchTerm)) {
        if (searchInput) {
            searchInput.classList.add("invalid");
            searchInput.setCustomValidity("Enter valid Country Name.");
        }
        if (searchError) {
            searchError.textContent = "Enter valid Country Name.";
            searchError.classList.add("visible");
        }
        return;
    }

    if (searchInput) {
        searchInput.setCustomValidity("");
        if (!searchInput.checkValidity()) {
            searchInput.setCustomValidity("Enter valid country name");
            searchInput.classList.add("invalid");
            if (searchError) {
                searchError.classList.add("visible");
            }
            return;
        }
        searchInput.classList.remove("invalid");
    }

    if (populationError) {
        populationError.classList.remove("visible");
    }

    if (minPopulation !== "") {
        const minPopulationValue = Number(minPopulation);
        if (
            Number.isNaN(minPopulationValue) ||
            minPopulationValue > 1500000000
        ) {
            if (minPopulationInput) {
                minPopulationInput.classList.add("invalid");
            }
            if (populationError) {
                populationError.classList.add("visible");
            }
            return;
        }
        if (minPopulationInput) {
            minPopulationInput.classList.remove("invalid");
        }
    }

    if (searchError) {
        searchError.classList.remove("visible");
    }

    const filteredCountries = filterData(searchTerm, region, minPopulation);
    populateCountryCards(filteredCountries);
    updateShowMoreButton(filteredCountries);
}

// Populate the country cards based on the filtered data
function populateCountryCards(countries) {
    // Get the container element where the country cards will be displayed
    const countryCardsContainer = document.getElementById(
        "country-cards-container",
    );

    if (countryCardsContainer) {
        countryCardsContainer.innerHTML = "";
    }

    // Check if the countries array is empty and display an error message if it is
    if (!countries || countries.length === 0) {
        if (countryCardsContainer) {
            countryCardsContainer.innerHTML =
                "<p class='error-message'>No countries found. Please try a different search or selection.</p>";
        }

        return;
    }

    const loopCounter = Math.min(displayCount, countries.length);

    for (let i = 0; i < loopCounter; i++) {
        // Get the current country from the array
        const country = countries[i];

        // Create a card element for each country
        const card = document.createElement("div");

        // Add a class to the card for styling purposes
        card.classList.add("country-card");

        // Create elements for the card
        const flagImg = document.createElement("img");
        const countryName = document.createElement("h2");
        const capital = document.createElement("p");
        const population = document.createElement("p");
        const region = document.createElement("p");

        // Append elements to the card
        flagImg.src = country.flags.png;
        flagImg.alt = country.name.common;
        countryName.innerHTML = country.name.common;
        capital.innerHTML = `<strong>Capital:</strong> ${country.capital}`;
        population.innerHTML = `<strong>Population:</strong> ${country.population.toLocaleString()}`;
        region.innerHTML = `<strong>Region:</strong> ${country.region}`;

        card.appendChild(flagImg);
        card.appendChild(countryName);
        card.appendChild(capital);
        card.appendChild(population);
        card.appendChild(region);

        // Make the card clickable and navigate to the details page
        card.style.cursor = "pointer";
        card.addEventListener("click", () => countryCardHandler(country));

        if (countryCardsContainer) {
            countryCardsContainer.appendChild(card);
        }
    }
}

function updateShowMoreButton(filteredCountries) {
    const showMoreButton = document.getElementById("show-more");
    if (!showMoreButton) {
        return;
    }

    if (
        !filteredCountries ||
        filteredCountries.length <= INITIAL_DISPLAY_COUNT
    ) {
        showMoreButton.style.display = "none";
        return;
    }

    showMoreButton.style.display = "block";
    if (displayCount >= filteredCountries.length) {
        showMoreButton.textContent = "Show Less";
    } else {
        showMoreButton.textContent = "Show More";
    }
}

// Increment the number of filtered countries displayed by 10
function showMoreHandler() {
    const searchInput = document.getElementById("search-input");
    const regionSelect = document.getElementById("region-select");
    const minPopulationInput = document.getElementById("min-population");

    const searchTerm = searchInput ? searchInput.value : "";
    const region = regionSelect ? regionSelect.value : "";
    const minPopulation = minPopulationInput ? minPopulationInput.value : "";
    const filteredCountries = filterData(searchTerm, region, minPopulation);

    // If all countries are currently displayed, reset to initial count. Otherwise, show more.
    if (displayCount >= filteredCountries.length) {
        displayCount = INITIAL_DISPLAY_COUNT;
    } else {
        displayCount = Math.min(
            displayCount + displayIncrement,
            filteredCountries.length,
        );
    }

    applyFilters(false);
}

function getQueryParams() {
    return Object.fromEntries(new URLSearchParams(window.location.search));
}

function populateDetailsPage() {
    const params = getQueryParams();
    const countryName = document.getElementById("country-name");
    const countryFlag = document.getElementById("country-flag");
    const countryCapital = document.getElementById("country-capital");
    const countryPopulation = document.getElementById("country-population");
    const countryRegion = document.getElementById("country-region");
    const countrySubregion = document.getElementById("country-subregion");
    const countryLanguages = document.getElementById("country-languages");
    const countryCurrencies = document.getElementById("country-currencies");

    if (countryName) {
        countryName.textContent = params.name || "";
    }
    if (countryFlag) {
        countryFlag.src = params.flag || "";
        countryFlag.alt = params.name ? `${params.name} Flag` : "Country Flag";
    }
    if (countryCapital) {
        countryCapital.textContent = params.capital || "";
    }
    if (countryPopulation) {
        countryPopulation.textContent = params.population || "";
    }
    if (countryRegion) {
        countryRegion.textContent = params.region || "";
    }
    if (countrySubregion) {
        countrySubregion.textContent = params.subregion || "";
    }
    if (countryLanguages) {
        countryLanguages.textContent = params.languages || "";
    }
}

function setupDetailsPage() {
    const backButton = document.getElementById("back");
    if (backButton) {
        backButton.addEventListener("click", () => {
            window.location.href = "index.html";
        });
    }
    if (document.getElementById("country-name")) {
        populateDetailsPage();
    }
}

// Set up event listeners for the filter inputs
function setupFilterListeners() {
    const searchInput = document.getElementById("search-input");
    const regionSelect = document.getElementById("region-select");
    const minPopulationInput = document.getElementById("min-population");
    const showMoreButton = document.getElementById("show-more");

    const onFilterChange = () => applyFilters();

    if (searchInput) {
        searchInput.addEventListener("input", onFilterChange);
    }
    if (regionSelect) {
        regionSelect.addEventListener("change", onFilterChange);
    }
    if (minPopulationInput) {
        minPopulationInput.addEventListener("input", onFilterChange);
    }
    if (showMoreButton) {
        showMoreButton.addEventListener("click", showMoreHandler);
    }
}

setupFilterListeners();
applyFilters();
setupDetailsPage();
