# Docker: Valor Garage

*Self-hosted hobby-fleet garage application with integrated tools like a task planner, wiring diagram design and more!*

# What

## Features (W.I.P.)

### Fleet Bay (cars)
Adding/removing cars you own or have let go. Describing simple details from make and model up to more detailed stats like cylinder volume and gear ratio's. All these details are eventually also useful in other features listed below.

### Jobs & Projects (tasks, projects)
For each car you are able to create jobs. These can range from the usual annual or per milage oil changes up to small and large repairs. Modifications also belong here but eventually result in a mod entry when completed. Oil changes result in a calcuable field so you can see how many km's ago you had an oil change for example. Also applicable on other repaired and/or maintenance items since parts more often wear out over distance than over time. 

### Costs Logger (costs)
Sometimes it's hard to keep track what you spend over time while just regularly using your cars. Not only limited to fuel but also parts used in repairs and modifications and consumables while working on your vehicle like oil and coolant.

### Wiring Diagram Designer (diagrams)
If you want to understand the electrical internals more. You often go digging around in wiring harnesses and such, jotting down rough details on a scrap piece of paper. But what if you want to review what you already delved into later on? This is where a wiring diagram tool comes in clutch! Being existing OEM equipment or your own handcrafted harnesses and connectors. Design them here and assign them to a garage member.

### Mod Central (mods)
A modification archive where you can list your mod parts and document your implementations.  
These mods can inherrently also be related to jobs from the job planner when you are getting ready to install them.

### The Warehouse (items)
An inventory tool where you intake all purchased items you bring in. OEM parts, custom parts, consumables and raw materials being a few. Store them neatly wherever you like, a type of rack, bins you've labeled, ... Scan the barcode/qrcode on them for a quick and organized way of keeping track of your stuff. No more double ordering parts or oil filters while you already have some laying around. When consuming an item you'll be able to scan the barcode and simply say it's gone now and the item will be listed as "out-of-stock". Letting you know when you need to order more.

### Showcase Gallery (photos)
Owning a car you're proud of, you probably have an unhealthy amount of pictures too! Make or link albums here. You can also assign a picture to be the cover of your car's fleet profile.


## Contents

- **DEV.md:** Development notes and instructions
- **package.json:** Project dependencies and scripts
- **next.config.ts:** Next.js configuration file
- **eslint.config.js:** ESLint configuration file
  

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
- [ ] Homepage: hero image is a default one up until there is at least one photo available inside any gallery, make the hero image random too each time loading the front page
- [ ] actions/cars: Has a "parts" function but this could eventually be another type of object
- [ ] Convert into docker image