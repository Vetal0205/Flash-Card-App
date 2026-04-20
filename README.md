# Flash-Card-App
Web application designed for students to create flash cards to help them study.

Members:
- Srinidhi Sivakaminathan
- Qays Hawwar
- Vitalii Besliubniak
- Halema Diab
- Aaliyan Siddiqui

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) must be installed and running before any of the steps below.

## Run With Docker

This project supports two Docker setups:

- `dev` mode for local development
- `stage` mode for a production-style local environment

### 1. Create your `.env` file

Copy the repo-level environment template:

**PowerShell (Windows):**
```powershell
Copy-Item .env.example .env
```

**Bash (macOS / Linux / Git Bash):**
```bash
cp .env.example .env
```

### 2. Edit `.env`

Open `.env`. For a first run you only **need** to change the JWT secrets — the database passwords default to `postgres` and work as-is for local use:

| Variable | Why |
|---|---|
| `DEV_SECRET` | JWT signing secret — replace the placeholder with any long random string |
| `STAGE_SECRET` | JWT signing secret for staging — same requirement |

Everything else can stay at its default for local development.

> **Note:** `DEV_POSTGRES_PASSWORD` and `DEV_DB_PASSWORD` are two separate variables that both configure the same database password (one for the Postgres container, one for the backend). If you change one, change the other to match. The same applies to the `STAGE_` equivalents.

### Port Requirements

Make sure these ports are free **before** starting each stack:

| Port | Service | Stack |
|---|---|---|
| `3000` | Frontend | dev |
| `5000` | Backend | dev |
| `5432` | PostgreSQL | dev |
| `8080` | Frontend | stage |
| `5002` | Backend | stage |
| `5433` | PostgreSQL | stage |

Dev and stage ports are intentionally different so both stacks can run simultaneously.

### Development Mode

Start the development stack from the project root:

```bash
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

```bash
docker compose down
```

Remove the development database volume too:

```bash
docker compose down -v
```

### Staging Mode

Start the staging stack from the project root:

```bash
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

```bash
docker compose -f docker-compose.stage.yml down
```

Remove the staging database volume too:

```bash
docker compose -f docker-compose.stage.yml down -v
```

## Getting Started

Once the app is running at `http://localhost:3000`:

1. **Register / Log in** — create an account or sign in with an existing one.
2. **Create a collection** — a collection is a named set of flashcards (e.g. "Biology Chapter 3"). Create one from the dashboard.
3. **Import flashcards** — open the collection and use the import option to upload a `.txt` file in `Q: / A:` format. `sample_flashcards.txt` in the project root is ready to use for a quick test.
4. **Study** — start a study session on any collection, mark cards as known or unknown, and track your progress.

## Import Testing

`sample_flashcards.txt` in the project root is a sample file for testing the flashcard import feature. It uses the `Q: / A:` format and contains 5 cards ready to import.

## Database Access

You can connect to the Docker databases from a local Postgres client using these defaults (from `.env.example`):

| | Development | Staging |
|---|---|---|
| Host | `localhost` | `localhost` |
| Port | `5432` | `5433` |
| User | `postgres` | `postgres` |
| Password | value of `DEV_POSTGRES_PASSWORD` | value of `STAGE_POSTGRES_PASSWORD` |
| Database | `minddeck` | `minddeck_stage` |

You can also inspect either database through Docker:

Development:

```bash
docker compose exec database psql -U postgres -d minddeck
```

Staging:

```bash
docker compose -f docker-compose.stage.yml exec database psql -U postgres -d minddeck_stage
```

### Useful psql Commands

Once inside the psql shell:

| Command | Description |
|---|---|
| `\dt` | List all tables |
| `\d <table>` | Describe a table's columns and types |
| `\di` | List all indexes |
| `\dn` | List schemas |
| `\x` | Toggle expanded (vertical) row display |
| `\q` | Quit |

Example queries:

```sql
-- Basic lookups
SELECT * FROM users;
SELECT * FROM flashcards;

-- Collections with their flashcard count
SELECT c."collectionID", c."collectionName", COUNT(f."flashcardID") AS flashcard_count
FROM collections c
LEFT JOIN flashcards f ON f."collectionID" = c."collectionID"
GROUP BY c."collectionID", c."collectionName";

-- Study session response breakdown per session
SELECT ss."sessionID", ss."userID", ss."collectionID", ss.status,
       COUNT(r."responseID") AS total,
       SUM(CASE WHEN r."responseType" = 'known' THEN 1 ELSE 0 END) AS known,
       SUM(CASE WHEN r."responseType" = 'unknown' THEN 1 ELSE 0 END) AS unknown
FROM study_sessions ss
LEFT JOIN study_session_responses r ON r."sessionID" = ss."sessionID"
GROUP BY ss."sessionID";
```
