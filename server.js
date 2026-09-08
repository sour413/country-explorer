const helmet = require("helmet");
const express = require('express');
const path = require("path");
const { fetchCountries } = require("./countries-services");

const app = express();
const PORT = 3000;

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: [
                "'self'",
                "http://localhost:3000",
                "ws://localhost:3000",
            ],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:", "http://localhost:3000"],
        },
    }),
);

app.get("/countries", async (req, res) => {
    try {
        const countries = await fetchCountries();
        res.status(200).json(countries);
    } catch (error) {
        // console.error("Error fetching countries:", error);
        res.status(500).json({ error: "Failed to fetch countries" });
    }
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/details", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "details.html"));
});

app.use((req, res) => {
    res.status(404).send("Page not found");
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
