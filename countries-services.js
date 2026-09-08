// Import the 'https' module
const https = require("https");

// Define the fetchCountries function
function fetchCountries() {
    return new Promise(function (resolve, reject) {
        const API_URL = {
            hostname: "api.restcountries.com",
            path: "/countries/v5?limit=100&fields=name,capital,population,region,flag",
            method: "GET",
            headers: {
                // Pass your API key or use 'Bearer rc_live_demo' for testing
                Authorization:
                    "Bearer rc_live_4d106586a8884aeb9107fcd0e8ce337f",
            },
        };

        let req = https.get(API_URL, function (res) {
            let data = "";

            // A chunk of data has been received.
            res.on("data", function (chunk) {
                data += chunk;
            });

            // The whole response has been received.
            res.on("end", function () {
                try {
                    const countriesData = JSON.parse(data);
                    resolve(countriesData);
                } catch (error) {
                    reject(error);
                }
            });
        });

        // Handle errors in the request
        req.on("error", function (error) {
            reject(error);
        });

        req.end();
    });
}

// Export the fetchCountries function for use in controller.js
module.exports = {
    fetchCountries,
};
