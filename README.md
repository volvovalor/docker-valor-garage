# Docker: Valor Garage
*Self-hosted hobby-fleet garage application with integrated tools like a task planner, wiring diagram design and more!*

## What

## How
### Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). SQLite and uploads live in `./data`.


### Docker

```bash
docker compose up --build
```

The database and photos persist in `./data`.
