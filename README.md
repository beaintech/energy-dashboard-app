# Energy Dashboard

A Vue 3 + TypeScript energy management dashboard with real-time device monitoring, filtering, and ECharts visualization.

## Features

- 🔋 Real-time device monitoring with status updates
- 📊 Interactive ECharts for PV, Grid, and Load data
- 🔍 Advanced filtering by status and search
- 📄 Pagination with customizable page sizes
- 🌓 Dark/Light theme support
- 📱 Responsive design

## Tech Stack

- **Vue 3** - Composition API
- **TypeScript** - Type safety
- **Vuex** - State management
- **Vue Router** - Navigation
- **ECharts** - Data visualization
- **Vite** - Build tool
- **SCSS** - Styling

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment to GitHub Pages

### Automatic Deployment

This project is configured to automatically deploy to GitHub Pages when you push to the `main` branch.

### Setup Steps

1. **Enable GitHub Pages in your repository:**
   - Go to your GitHub repository
   - Click on **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**

2. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

3. **Wait for deployment:**
   - Go to the **Actions** tab in your repository
   - Watch the deployment workflow complete
   - Once done, your site will be live at: `https://[your-username].github.io/energy-dashboard-app/`

### Manual Deployment

If you prefer to deploy manually:

```bash
# Build the project
npm run build

# The dist folder contains the production build
# Deploy the contents of the dist folder to your hosting service
```

## Project Structure

```
energy-dashboard/
├── public/              # Static assets
│   └── api/            # Mock API data
├── src/
│   ├── api/            # API endpoints
│   ├── components/     # Vue components
│   ├── composables/    # Composition functions
│   ├── pages/          # Page components
│   ├── router/         # Vue Router config
│   ├── store/          # Vuex store
│   ├── styles/         # Global styles
│   ├── App.vue         # Root component
│   └── main.ts         # Application entry
├── .github/
│   └── workflows/      # GitHub Actions workflows
└── vite.config.ts      # Vite configuration
```

## Features Overview

### Dashboard
- View real-time device status (charging, idle, offline, error)
- Monitor PV generation, grid usage, and load consumption
- Interactive charts with synchronized zoom/pan

### Filtering
- Filter devices by status
- Search by device name or ID
- German character support (ä, ö, ü, ß)

### Pagination
- Adjustable page size (5, 10, 20 items)
- Automatic page reset on filter changes

## License

MIT
