# User Management Backend

This is the backend API for the User Management Video Platform, built with NestJS.

## Tech Stack

-   **Framework**: NestJS
-   **Language**: TypeScript
-   **Database**: PostgreSQL (via TypeORM)
-   **Authentication**: Passport.js (JWT)
-   **Documentation**: Swagger (OpenAPI)
-   **Video Processing**: FFmpeg

## Modules

-   **Auth**: User registration, login, JWT issuance.
-   **Users**: Profile management, password updates.
-   **Videos**: Video upload, transcoding, listing, metadata management.
-   **Playlists**: Playlist creation and management.
-   **Wallet**: Balance tracking and withdrawal requests.

## Documentation

Detailed API documentation can be found in the `docs/` directory:

-   [OpenAPI Spec](docs/openapi.yaml)
-   [AsyncAPI Spec](docs/asyncapi.yaml)
-   [Postman Collection](docs/postman.json)

## Getting Started

### Prerequisites

-   Node.js 18+
-   PostgreSQL Database
-   FFmpeg (for video processing)

### Installation

1.  Navigate to the directory:
    ```bash
    cd project-name
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure environment:
    ```bash
    cp .env.example .env
    ```
    Update `.env` with your Database credentials and JWT Secret.

### Running Locally

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3001`.

### Running with Docker

You can run the backend and database using the `docker-compose.yml` in this directory:

```bash
docker-compose up --build
```
