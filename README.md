<!-- TODO: Manually review the settings changes on the dev machine. -->

# Docker: Valor Garage

*Self-hosted hobby-fleet garage application with integrated tools like a task planner, wiring diagram design and more!*

# What
## Contents

- **.vscode/**: VSCode workspace settings and launch configurations
- **data/**: Persistent data storage for SQLite database and uploaded files
- **public/**: Public assets and static files for the application
- **src/**: Source code for the application, including components, actions, and database logic
- **.dockerignore:** Files and directories to ignore when building the Docker image
- **.env.example:** Example environment variables for configuration
- **.gitignore:** Files and directories to ignore in Git version control
- **AGENTS.md:** Notes on AI agents and their usage in the application
- **DEV.md:** Development notes and instructions
- **docker-compose.yml:** Docker Compose configuration for running the application and its dependencies
- **Dockerfile:** Instructions for building the Docker image
- **eslint.config.js:** ESLint configuration file
- **next.config.ts:** Next.js configuration file
- **package-lock.json:** Exact versions of dependencies
- **package.json:** Project dependencies and scripts
- **tsconfig.json:** TypeScript configuration file


## Features (W.I.P.)
### Fleet Bay (cars)
Adding/removing cars you own or have let go. Describing simple details from make and model up to more detailed stats like cylinder volume and gear ratio's. All these details are eventually also useful in other features listed below.

### Jobs & Projects (tasks, projects)
For each car you are able to create jobs. These can range from the usual annual or per milage oil changes up to small and large repairs. Modifications also belong here but eventually result in a mod entry when completed. Oil changes result in a calcuable field so you can see how many km's ago you had an oil change for example. Also applicable on other repaired and/or maintenance items since parts more often wear out over distance than over time. 

### Costs Logger (costs)
Open **Costs** on a vehicle to log fill-ups and other expenses such as insurance, maintenance, taxes, and tolls. Fill-ups record the current date and time, odometer, liters, fuel type, price per liter, discount, station, notes, and an optional JPG, PNG, or WebP receipt up to 8 MiB. Station lookup is optional: on HTTPS or localhost, **Find nearby station** asks for location permission and sends coordinates to the OpenStreetMap Overpass service. The app stores only the selected station name; manual entry always works.

Charts cover spending, estimated distance, fuel volume, effective price, fill-up count, and measured consumption. Monthly distance is apportioned between consecutive odometer readings; it isn't a trip log. Consumption uses full-to-full intervals of the same fuel type, includes partial fills, and skips gaps marked as missed. Metric mode shows km and L/100 km; imperial mode shows miles and US mpg. Fuel and prices are still entered in liters and per liter. Set `FUEL_CURRENCY` in the server or Compose environment before logging expenses (default `EUR`); changing it changes the display label, not past amounts. Fuel records, receipts, and other expenses are included in garage backups.

Run the fuel calculation checks with `node --experimental-strip-types --test tests/fuel.test.mjs` (Node.js 22.6 or newer).

### Wiring Diagram Designer (diagrams)
If you want to understand the electrical internals more. You often go digging around in wiring harnesses and such, jotting down rough details on a scrap piece of paper. But what if you want to review what you already delved into later on? This is where a wiring diagram tool comes in clutch! Being existing OEM equipment or your own handcrafted harnesses and connectors. Design them here and assign them to a garage member.

### Mod Central (mods)
A modification archive where you can list your mod parts and document your implementations.  
These mods can inherrently also be related to jobs from the job planner when you are getting ready to install them.

### The Warehouse (items)
An inventory for OEM parts, custom parts, consumables, tools, and raw materials. Record quantities, units, reorder points, suppliers, and storage locations such as racks and bins. Search by name, SKU, barcode, or QR code; use a camera or handheld scanner to find an item, then receive stock, consume a quantity, or mark it out of stock. Generate and print QR/Code128 labels for items that do not have a code.

### Showcase Gallery (photos)
Owning a car you're proud of, you probably have an unhealthy amount of pictures too! Make or link albums here. You can also assign a picture to be the cover of your car's fleet profile.
  

# How
## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). SQLite and uploads live in `./data`.
You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.


## Docker

```bash
docker compose up --build
```

The database and photos persist in `./data`.


# Todo

- [ ] Favicon more in theme of application
- [ ] globals.css: seperate global styling and styling for elements, pages
- [ ] actions/cars: Has a "parts" function but this could eventually be another type of object
- [ ] Convert into docker image
