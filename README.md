# Flash-Card-App
Web application deigned for students to be able to create flash cards to help them study.

Members:
- Srinidhi Sivakaminathan
- Qays Hawwar
- Vitalii Besliubniak
- Halema Diab
- Aaliyan Siddiqui

## Run With Docker

This project supports two Docker setups:

- `dev` mode for local development
- `stage` mode for a production-style local environment

Before using either Docker setup, copy the repo-level environment template:

```powershell
Copy-Item .env.example .env
```

### Development Mode

Start the development stack from the project root:

```powershell
docker compose up --build
```

This starts:

- frontend at `http://localhost:3000`
- backend at `http://localhost:5000`
- backend health check at `http://localhost:5000/health`
- PostgreSQL at `localhost:5432`

Notes:

- the backend automatically runs schema sync on startup
- the development database is stored in the Docker volume `postgres_data`

Stop the development stack:

```powershell
docker compose down
```

Remove the development database volume too:

```powershell
docker compose down -v
```

### Staging Mode

Start the staging stack from the project root:

```powershell
docker compose -f docker-compose.stage.yml up --build
```

This starts:

- frontend at `http://localhost:8080`
- backend at `http://localhost:5002`
- backend health check at `http://localhost:5002/health`
- PostgreSQL at `localhost:5433`

Notes:

- staging uses the `stage` Docker targets
- the backend automatically runs schema sync before starting
- the staging database is separate from development and uses the Docker volume `postgres_stage_data`

Stop the staging stack:

```powershell
docker compose -f docker-compose.stage.yml down
```

Remove the staging database volume too:

```powershell
docker compose -f docker-compose.stage.yml down -v
```

## Database Access

You can connect to the Docker databases from a local Postgres client.

Development database:

- use the development values defined in the repo-level `.env`
- the development database is exposed through the port configured in `docker-compose.yml`

Staging database:

- use the staging values defined in the repo-level `.env`
- the staging database is exposed through the port configured in `docker-compose.stage.yml`

You can also inspect either database through Docker:

Development:

```powershell
docker compose exec database psql -U postgres -d minddeck
```

Staging:

```powershell
docker compose -f docker-compose.stage.yml exec database psql -U postgres -d minddeck_stage
```

