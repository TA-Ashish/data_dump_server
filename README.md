# data_dump_server

A lightweight Node.js/TypeScript Express server that stores arbitrary JSON payloads to MongoDB, tagged with a `userId` from the request header.

## Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express
- **Database:** MongoDB via Mongoose
- **Validation:** Zod (env config) + header middleware
- **Logging:** Winston + Morgan
- **Security:** Helmet, express-rate-limit
- **Testing:** Jest + Supertest + mongodb-memory-server

## API

### `POST /api/v1/dump`

Stores any JSON body along with the caller's user ID.

**Headers**

| Header | Required | Description |
|---|---|---|
| `x-user-id` | Yes | Identifier of the user making the request |
| `Content-Type` | Yes | `application/json` |

**Body**

Any valid JSON object.

**Response `201`**

```json
{
  "success": true,
  "data": {
    "id": "<mongo_object_id>",
    "userId": "user-abc",
    "createdAt": "2026-04-24T08:00:00.000Z"
  }
}
```

**Response `400`** — missing or blank `x-user-id` header

```json
{
  "success": false,
  "error": "Missing or invalid required header: x-user-id"
}
```

### `GET /health`

```json
{ "status": "ok" }
```

## Getting Started

### Prerequisites

- Node.js >= 20
- MongoDB instance (local or hosted)

### Setup

```bash
npm install
cp .env.example .env   # then fill in MONGODB_URI
```

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | `development` / `production` / `test` |
| `PORT` | `3000` | HTTP port |
| `MONGODB_URI` | — | MongoDB connection string (required) |
| `LOG_LEVEL` | `info` | `error` / `warn` / `info` / `debug` |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Rate limit window in ms |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |

### Scripts

```bash
npm run dev       # start dev server with hot-reload
npm run build     # compile TypeScript → dist/
npm start         # run compiled server
npm test          # run integration tests
npm run lint      # ESLint
npm run format    # Prettier
```

## Example

```bash
curl -X POST http://localhost:3000/api/v1/dump \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-abc" \
  -d '{"event":"login","meta":{"ip":"1.2.3.4","browser":"Chrome"}}'
```

## Deploy (Railway)

1. Create a project on [Railway](https://railway.app) and add a MongoDB plugin
2. Set `MONGODB_URI` from the plugin's connection string in your service variables
3. Set `NODE_ENV=production`
4. Railway auto-runs `npm run build` then `npm start`
