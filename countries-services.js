const https = require("https");

function fetchCountries() {
    return new Promise(function (resolve, reject) {
        const options = {
            hostname: "api.restcountries.com",
            path: "/countries/v5?limit=100",
            method: "GET",
            headers: {
                Authorization:
                    "Bearer rc_live_4d106586a8884aeb9107fcd0e8ce337f",
            },
        };

        let req = https.get(options, function (res) {
            let data = "";

            // A chunk of data has been received.
            res.on("data", function (chunk) {
                data += chunk;
            });

            // The whole response has been received.
            res.on("end", function () {
                try {
                    let countriesData = JSON.parse(data);
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

module.exports = {
    fetchCountries,
};