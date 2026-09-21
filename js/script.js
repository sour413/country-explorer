// Define the number of data to display and the increment step.
const INITIAL_DISPLAY_COUNT = 12;
const displayIncrement = 12; // Fixes ReferenceError: displayIncrement is not defined
let displayCount = INITIAL_DISPLAY_COUNT;
let allCountries = [];

// function to fetch data from the server-side endpoint
async function fetchData() {
    const countryCardsContainer = document.getElementById(
        "country-cards-container",
    );
    const showMoreBtn = document.getElementById("show-more-btn");

    try {
        // 1. Show loading state and hide "Show More" button temporarily
        if (countryCardsContainer) {
            countryCardsContainer.innerHTML = `
                <div class="spinner-container">
                    <div class="spinner"></div>
                </div>
            `;
        }

        if (showMoreBtn) {
            showMoreBtn.style.display = "none";
        }

        const response = await fetch("/countries");

        if (!response.ok) {
            throw new Error("HTTP error! Status: " + response.status);
        }

        const data = await response.json();

        // 3. Extract and store the array properly into allCountriesData
        // Handles data wrapped in `{ data: { objects: [...] } }`, `{ objects: [...] }`, or a direct array `[...]`
        if (Array.isArray(data)) {
            allCountriesData = data;
        } else if (data && Array.isArray(data.objects)) {
            allCountriesData = data.objects;
        } else if (data && data.data && Array.isArray(data.data.objects)) {
            allCountriesData = data.data.objects;
        } else {
            allCountriesData = [];
        }

        // 4. Trigger initial rendering once data is ready
        applyFilters(true);

        return allCountriesData;
    } catch (error) {
        console.error("Error fetching countries data:", error);

        // 4. Display error message to user if fetch fails
        if (countryCardsContainer) {
            countryCardsContainer.innerHTML = `
                <p class="error-message">Failed to load country data. Please try again later.</p>
            `;
        }

        throw error;
    }
}

// 2. Separate event listener that runs when the DOM loads
document.addEventListener("DOMContentLoaded", async function () {
    try {
        const data = await fetchData();
    } catch (error) {
        console.error("Error during initialization:", error);
    }

    // 2. Attach click event listener to the "Show More" button
    const showMoreButton = document.getElementById("show-more-btn"); // Replace with your actual button ID
    if (showMoreButton) {
        showMoreButton.addEventListener("click", showMoreHandler);
    }
});

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

// Helper function to format currencies
function getFormattedCurrencies(currencies) {
    if (!currencies) return "";

    // If currencies is an Array of objects: [{ name: "Russian ruble", symbol: "₽" }]
    if (Array.isArray(currencies)) {
        return currencies
            .map((c) => c.name || c)
            .filter(Boolean)
            .join(", ");
    }

    // If currencies is an Object map: { "RUB": { name: "Russian ruble" } }
    if (typeof currencies === "object") {
        return Object.keys(currencies)
            .map((code) => currencies[code]?.name || currencies[code])
            .filter(Boolean)
            .join(", ");
    }

    return String(currencies);
}

// Helper function to format languages
function getFormattedLanguages(languages) {
    if (!languages) return "";

    // If languages is an Array of objects: [{ name: "English" }, { name: "French" }]
    if (Array.isArray(languages)) {
        return languages
            .map((l) => l.name || l.language || l)
            .filter(Boolean)
            .join(", ");
    }

    // If languages is an Object map: { "eng": "English" }
    if (typeof languages === "object") {
        return Object.keys(languages)
            .map((code) => languages[code]?.name || languages[code])
            .filter(Boolean)
            .join(", ");
    }

    return String(languages);
}

// Function to populate country cards in the DOM
function populateCountryCards(data) {
    const countryCardsContainer = document.getElementById(
        "country-cards-container",
    );

    if (countryCardsContainer) {
        countryCardsContainer.innerHTML = "";
    }

    // Extract the array directly from data.data.objects
    let countriesArray = [];
    if (data && data.data && Array.isArray(data.data.objects)) {
        countriesArray = data.data.objects;
    } else if (Array.isArray(data)) {
        countriesArray = data;
    }

    // Validate array content
    if (!countriesArray || countriesArray.length === 0) {
        if (countryCardsContainer) {
            countryCardsContainer.innerHTML =
                "<p class='error-message'>No data found. Please try a different search or selection.</p>";
        }
        return;
    }

    // Set the count limit to 12 or use displayCount if it's set to 12
    const countToDisplay =
        typeof displayCount !== "undefined" ? displayCount : 12;
    const itemsToDisplay = countriesArray.slice(0, countToDisplay);

    itemsToDisplay.forEach(function (country) {
        const card = document.createElement("div");
        card.classList.add("country-card");

        const flagImg = document.createElement("img");
        const countryName = document.createElement("h2");
        const capital = document.createElement("p");
        const population = document.createElement("p");
        const region = document.createElement("p");

        // Property access based on logged object structure
        const commonName =
            country.names?.common ||
            country.name?.common ||
            country.name ||
            "N/A";
        const capitalName =
            country.capitals?.[0]?.name || country.capitals?.name || "N/A";
        const popValue = country.population
            ? country.population.toLocaleString()
            : "N/A";
        const regionName = country.region || "N/A";
        const flagSrc =
            country.flag?.url_png ||
            country.flag?.url_svg ||
            (typeof country.flag === "string"
                ? country.flag
                : country.flags?.url_png || "");

        flagImg.src = flagSrc;
        flagImg.alt = commonName;
        countryName.innerHTML = commonName;
        capital.innerHTML = `<strong>Capital:</strong> ${capitalName}`;
        population.innerHTML = `<strong>Population:</strong> ${popValue}`;
        region.innerHTML = `<strong>Region:</strong> ${regionName}`;

        card.appendChild(flagImg);
        card.appendChild(countryName);
        card.appendChild(capital);
        card.appendChild(population);
        card.appendChild(region);

        card.style.cursor = "pointer";
        card.addEventListener("click", () => countryCardHandler(country));

        if (countryCardsContainer) {
            countryCardsContainer.appendChild(card);
        }
    });
}

// Build a query string from a country object and navigate to the Details page
function countryCardHandler(country) {
    // Extract flag URL string
    const flagUrl =
        country.flag?.url_png ||
        country.flag?.url_svg ||
        (typeof country.flag === "string" ? country.flag : "");

    // Extract capital name safely
    const capitalName =
        country.capitals?.[0]?.name ||
        country.capitals?.name ||
        (Array.isArray(country.capital)
            ? country.capital[0]
            : country.capital) ||
        "";

    // Format currencies and languages strings
    const currenciesString = getFormattedCurrencies(country.currencies);
    const languagesString = getFormattedLanguages(country.languages);

    // Build the query parameters with formatted strings
    const queryParams = new URLSearchParams({
        name: country.names.common,
        capital: capitalName,
        population: country.population,
        region: country.region,
        flag: flagUrl,
        currencies: currenciesString,
        languages: languagesString,
    });

    // Navigate to the Details page with the updated query parameters
    window.location.href = `details.html?${queryParams.toString()}`;
}

// Filter the data based on the search term, region, and minimum population
function filterData(searchTerm, region, minPopulation) {
    if (!Array.isArray(allCountriesData)) {
        return [];
    }

    return allCountriesData.filter((country) => {
        // Extract country name safely based on common API schemas
        const name = (
            country.names?.common ||
            country.name?.common ||
            country.name ||
            ""
        ).toLowerCase();

        const countryRegion = (country.region || "").toLowerCase();
        const population = country.population || 0;

        const matchesSearch =
            !searchTerm ||
            name.toLowerCase().includes(searchTerm.toLowerCase().trim());
        const matchesRegion =
            !region || countryRegion.toLowerCase() === region.toLowerCase();
        const matchesPopulation =
            minPopulation === "" || population >= Number(minPopulation);

        return matchesSearch && matchesRegion && matchesPopulation;
    });
}

// Apply the filters and update the displayed country cards
function applyFilters(resetDisplayCount = true) {
    // Reset display count back to 12 whenever filters change
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

// Update the "Show More" button based on the number of filtered countries
function updateShowMoreButton(filteredCountries) {
    const showMoreButton = document.getElementById("show-more");

    if (!showMoreButton) {
        return;
    }

    // Hide button if dataset has 0 or 1 item
    if (!filteredCountries || filteredCountries.length <= 12) {
        showMoreButton.style.display = "none";
        return;
    }

    // Always keep the button visible if there are multiple cards
    showMoreButton.style.display = "block";

    // Change button text based on whether all items are showing
    if (displayCount >= filteredCountries.length) {
        showMoreButton.textContent = "Show Less";
    } else {
        showMoreButton.textContent = "Show More";
    }
}

// Increment the number of filtered data displayed by 10
function showMoreHandler() {
    const searchInput = document.getElementById("search-input");
    const regionSelect = document.getElementById("region-select");
    const minPopulationInput = document.getElementById("min-population");

    const searchTerm = searchInput ? searchInput.value : "";
    const region = regionSelect ? regionSelect.value : "";
    const minPopulation = minPopulationInput ? minPopulationInput.value : "";
    const filteredCountries = filterData(searchTerm, region, minPopulation);

    if (!Array.isArray(filteredCountries) || !filteredCountries.length) {
        return;
    }

    if (displayCount >= filteredCountries.length) {
        displayCount = INITIAL_DISPLAY_COUNT;
    } else {
        displayCount = Math.min(
            displayCount + displayIncrement,
            filteredCountries.length,
        );
    }

    // Render remaining cards without resetting displayCount
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
    if (countryLanguages) {
        countryLanguages.textContent = params.languages;
    }

    if (countryCurrencies) {
        countryCurrencies.textContent = params.currencies || "";
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
setupDetailsPage();
