const helmet = require("helmet");
const express = require("express");
const path = require("path");
const cors = require("cors");
const { fetchCountries } = require("./countries-services");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for cross-origin local requests
app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "https://country-explorer-7ql2.onrender.com",
            "https://sour413.github.io"
        ],
    }),
);

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: [
                "'self'",
                `http://localhost:${PORT}`,
                `ws://localhost:${PORT}`,
                "https://country-explorer-7ql2.onrender.com/countries",
            ],
            imgSrc: ["'self'", "data:", "https:"],
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

app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/details", (req, res) => {
    res.sendFile(path.join(__dirname, "details.html"));
});

app.use((req, res) => {
    res.status(404).send("Page not found");
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
