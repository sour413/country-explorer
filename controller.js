const fs = require("fs");
const path = require("path");
const { fetchCountries } = require("./countries-services");

// Handle incoming HTTP requests
function handleRequest(req, res) {
    let filePath = "." + req.url;

    if (filePath === "./") {
        filePath = "./index.html";
    } else if (filePath.startsWith("./detail.html")) {
        filePath = "./detail.html";
    }

    if (filePath === "./countries" && req.method === "GET") {
        fetchCountries()
            .then((data) => {
                if (data) {
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify(data));
                } else {
                    res.writeHead(500, { "Content-Type": "text/plain" });
                    res.end("Response data is null");
                }
            })
            .catch(function (error) {
                console.error("Error fetching countries:", error);
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end("Failed to fetch data");
            });

        return;
    }

    const extname = path.extname(filePath);

    if (extname) {
        readAndServe(filePath, extname, res);
    }
}

function getContentType(extname) {
    let contentType = "";

    switch (extname) {
        case ".html":
            contentType = "text/html";
            break;

        case ".js":
            contentType = "text/javascript";
            break;

        case ".css":
            contentType = "text/css";
            break;

        case ".png":
            contentType = "image/png";
            break;

        case ".svg":
            contentType = "image/svg+xml";
            break;

        case ".json":
            contentType = "application/json";
            break;
    }

    return contentType;
}

function readAndServe(filePath, extname, res) {
    filePath = decodeURIComponent(filePath);

    if (!fs.existsSync(filePath)) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("File not found");
        return;
    }

    fs.readFile(filePath, function (error, content) {
        if (error) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Server error: " + error.code);
        } else {
            const contentType = getContentType(extname);
            res.writeHead(200, { "Content-Type": contentType });
            res.end(content, "utf-8");
        }
    });
}

module.exports = { handleRequest };
