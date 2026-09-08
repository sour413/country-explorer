// 1. Import the required dependencies, such as the HTTP module.
const http = require("http");
const { handleRequest } = require("./controller");

// 4. Listen for requests on port 3000.
const PORT = 3000;

// Pass handleRequest as the callback function
const server = http.createServer(handleRequest);


server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
