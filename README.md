# Xeon

Xeon is a lightweight expense tracker web app built with plain HTML, CSS, and JavaScript.

## Features

- Add expenses with vendor/company name, description, category, amount, and date
- Edit and delete expenses
- Persistent storage using browser `localStorage`
- Live totals for overall spend, current month, and current year
- Monthly spending line chart and annual spending bar chart using Chart.js
- Responsive layout for desktop and mobile

## Getting Started

1. Open `index.html` in your browser.
2. Add expenses using the form.
3. Edit or delete entries from the expense list.
4. Data is saved automatically in the browser.

## GitHub Pages Hosting

This app is ready to host with GitHub Pages from the repository root.

1. Push the repository to GitHub.
2. Open the repository Settings > Pages.
3. Under "Source", choose `main` branch and `root`.
4. Save the settings.
5. Your app will be available at `https://<username>.github.io/Xeon/`.

## Files

- `index.html` — app layout and content
- `styles.css` — styling and responsive UI
- `script.js` — expense management, persistence, and charts

## Notes

- All data stays in the browser; no backend is required.
- If you want custom categories, additional charts, or export support, I can add them next.