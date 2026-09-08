const fs = require("fs");
const path = require("path");
const { fetchCountries } = require("./countries-services");

function getContentType(ext) {
    switch (ext) {
        case ".html":
            return "text/html";
        case ".css":
            return "text/css";
        case ".js":
            return "text/javascript";
        case ".png":
            return "image/png";
        case ".jpg":
        case ".jpeg":
            return "image/jpeg";
        case ".svg":
            return "image/svg+xml";
        case ".json":
            return "application/json";
        default:
            return "text/plain";
    }
}

function readAndServe(filePath, ext, res) {
    console.log(`Extension: ${ext}`);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === "ENOENT") {
                res.writeHead(404, { "Content-Type": "text/html" });
                res.end("<h1>404 Not Found</h1>");
            } else {
                res.writeHead(500, { "Content-Type": "text/html" });
                res.end("<h1>500 Internal Server Error</h1>");
            }
        } else {
            const contentType = getContentType(ext);
            res.writeHead(200, { "Content-Type": contentType });
            res.end(data);
        }
    });
}

function handleRequest(req, res) {
    // 1. Prepend dot to create relative path
    let filePath = "." + req.url;

    // 2. Default route
    if (filePath === "./") {
        filePath = "./index.html";
    }
    // 3. Detail page route
    else if (filePath.startsWith("./detail.html")) {
        filePath = "./detail.html";
    }

    // 4. Get file extension
    const extname = path.extname(filePath);

    // 5. Serve file if extension exists
    if (extname) {
        readAndServe(filePath, extname, res);
    }

    // 1. IF the requested filePath is "./countries" and the request method is "GET":
    if (filePath === "./countries" && req.method === "GET") {
        // 1.1. Call the fetchCountries() function
        fetchCountries()
            .then(function (data) {
                // 1.2. Define the resolve callback function:
                if (data) {
                    // 1.2.1. IF data returned successfully
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify(data));
                } else {
                    // 1.2.2. Else IF data is null
                    res.writeHead(500, { "Content-Type": "application/json" });
                    res.end(
                        JSON.stringify({ message: "Response data is null" }),
                    );
                }
            })
            .catch(function (error) {
                // 1.3. Define the reject callback function:
                console.error(error); // 1.3.1. Log error to console
                res.writeHead(500, { "Content-Type": "application/json" }); // 1.3.2. SET status code to 500
                res.end(JSON.stringify({ message: "Failed to fetch data" })); // 1.3.3. Send error message
            });
    }
}

module.exports = {
    handleRequest,
    readAndServe,
    getContentType,
};