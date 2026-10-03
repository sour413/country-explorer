# Country Explorer 🌍

A responsive, dynamic web application that allows users to explore country data—including flags, demographics, currencies, languages, and regional details. Built using a Node.js MVC architecture for backend API routing and hosted across Render and GitHub Pages.

![Project Status](https://img.shields.io/badge/Status-Active-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## 🚀 Live Demo

- **Frontend (GitHub Pages):** [https://sour413.github.io/country-explorer/](https://sour413.github.io/country-explorer/)
- **Backend API (Render):** `https://country-explorer.onrender.com/api/countries`

---

## ✨ Features

- **Dynamic Data Fetching:** Serves real-time data retrieved from the REST Countries API.
- **Search & Filter:** Search for specific countries by name or filter by geographic regions.
- **Detailed Country View:** Interactive pages displaying population, capital, subregions, currencies, top-level domains, and border countries.
- **Theme Switching:** Dark Mode and Light Mode support for accessibility.
- **Responsive Design:** Optimized layout across mobile, tablet, and desktop screens.

---

## 🛠️ Tech Stack & Architecture

### **Frontend**
- **HTML5 & CSS3:** Flexbox and Grid layouts, CSS custom properties for dark mode themes.
- **JavaScript (ES6+):** Async/await `fetch` operations, DOM manipulation, and dynamic component rendering.

### **Backend (Node.js MVC)**
- **Node.js & Express.js:** RESTful routing using Model-View-Controller architecture.
- **CORS & Helm:** Security headers and Cross-Origin Resource Sharing for secure cross-domain requests between Render and GitHub Pages.
- **Render:** Hosted Node.js web service handling backend endpoint requests.

---

## 📁 Repository Structure

```text
country-explorer/
├── .github/
│   └── workflows/
│       └── ci.yml              # CI workflow configuration
├── assets/                     # UI icons and static media assets
├── controllers/                # Request handling and backend business logic
│   └── countriesController.js
├── routes/                     # API route definitions
│   └── countriesRoutes.js
├── index.html                  # Main landing page
├── details.html                # Detailed country view page
├── script.js                   # Client-side API fetch and UI logic
├── style.css                   # Custom CSS styling and dark mode variables
├── server.js                   # Node.js Express server entry point
├── package.json                # Project dependencies and deployment scripts
└── README.md                   # Project documentation