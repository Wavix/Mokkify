[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![GitHub package.json version](https://img.shields.io/github/package-json/v/icevl/mokkify)
![GitHub last commit](https://img.shields.io/github/last-commit/icevl/mokkify)


# Mokkify

Welcome to **Mokkify** - a self-hosted RestAPI mocking service built with Next.js. Mokkify provides a flexible response builder and templating system for crafting your mocks, as well as support for Relay requests to an external hook to simulate various scenarios, like DLR. We've done our best to make the interface intuitive and easy to use.

[Demo](https://demo.mokkify.dev) admin / admin

## Features

- 🔁 RestAPI mocking
- 🏗️ Self-hosted
- ⚡ In-memory endpoint caching and batched log writes. 2,500+ rps on a single node
- 🧭 Path parameters and wildcards: `/users/:id`, `/files/*`
- 🧩 Flexible response builder and templates with variables
- 🎛️ Custom response headers and content types (JSON, XML, plain text, HTML, CSV)
- 🌐 CORS out of the box (preflight, custom headers, credentials)
- 📥 OpenAPI / Swagger import: generate endpoints from a spec
- ⏲️ Response delay emulation
- 🔄 Relay request support with external hooks
- 🔮 Intuitive interface with light & dark themes
- 🔐 Authorization
- 📈 Endpoint RPS graphics
- 🗄️ Dump and restore configuration

![Interface example (light theme)](docs/screenshot-light.png)

![Interface example (dark theme)](docs/screenshot-dark.png)

## Tech stack

Next.js 16 (Turbopack) · React 19 · Tailwind CSS 4 + shadcn/ui · Sequelize + SQLite (WAL)

## Requirements

- Node.js >= 20.17
- pnpm 10
- SQLite3

## Installation & Running

First, clone the repository:

```bash
git clone https://github.com/Wavix/Mokkify.git
```

Then, navigate to the project directory and install the necessary dependencies:

```bash
cd Mokkify
pnpm install
pnpm cli dbcreate
pnpm cli useradd <login> <password>
```

After that, start the project in development mode:

```bash
pnpm dev
```

Or build and run the production server:

```bash
pnpm build
pnpm start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Template variables

Response templates (and relay payloads) support variables that are resolved per request:

| Variable | Value |
| --- | --- |
| `@uuid` | Random UUID v4 |
| `@date` | Current date/time (ISO 8601) |
| `@dateYYYYMMDD` | Current date as `YYYYMMDD` |
| `@unix` | Current unix timestamp |
| `@request.field.nested` | Value from the request body or query string |
| `@response.field` | Value from the mock response body (relay payloads) |
| `@path.param` | Path parameter value (`/users/:param`); wildcard tail: `@path.wildcard` |

## Configuration

Environment variables (all optional):

| Variable | Default | Description |
| --- | --- | --- |
| `JWT_SECRET` | built-in dev secret | Secret used to sign auth tokens. **Set your own in production.** |
| `DATABASE_PATH` | `database.sqlite` | Path to the SQLite database file (mount a volume here in Docker). |
| `LOG_RETENTION_DAYS` | `30` | Request logs older than this are purged hourly. `0` disables the purge. |

A `GET /health` endpoint (no auth) reports service and database status for load balancers and container healthchecks.

## Nginx config for deployment

Response compression is intentionally disabled in the app server (`compress: false`) - enable gzip in nginx instead.

```
upstream webhook {
  server 127.0.0.1:3000;
}

location / {
    proxy_set_header Host <Your host>;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_pass http://webhook;
  }
```

## Support and Contributions

If you encounter any issues or have questions about using Mokkify, please create an "Issue" in this repository, and we'll be glad to assist you.

If you wish to contribute to the project's development, feel free to fork the repository and submit pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for more information.
