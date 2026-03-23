# HDRUK Datasets Explorer

A Next.js 14 application for browsing and searching HDRUK health data research datasets.

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                        Browser                           │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  DatasetTable.tsx (Client Component)               │  │
│  │  - Debounced search input (300ms)                  │  │
│  │  - Category filter dropdown                        │  │
│  │  - Pagination controls                             │  │
│  │  - Expandable descriptions                         │  │
│  │  - Responsive cards (mobile) / table (desktop)     │  │
│  └──────────────────┬─────────────────────────────────┘  │
│                     │ fetch /api/datasets?search=&       │
│                     │   category=&page=&limit=           │
└─────────────────────┼────────────────────────────────────┘
                      │
┌─────────────────────┼────────────────────────────────────┐
│  Next.js Server     │                                    │
│                     ▼                                    │
│  ┌──────────────────────────────────────────────────┐    │
│  │  app/page.tsx (Server Component)                  │    │
│  │  - Initial data fetch via internal API            │    │
│  │  - Passes props to DatasetTable                   │    │
│  └──────────────────┬───────────────────────────────┘    │
│                     │                                    │
│  ┌──────────────────▼───────────────────────────────┐    │
│  │  /api/datasets (Route Handler)                    │    │
│  │  - GET /api/datasets         → filtered array     │    │
│  │  - GET /api/datasets/:id     → single dataset     │    │
│  └──────────────────┬───────────────────────────────┘    │
│                     │                                    │
│  ┌──────────────────▼───────────────────────────────┐    │
│  │  lib/datasets.ts                                  │    │
│  │  - Fetches external JSON (ISR, revalidate: 3600)  │    │
│  │  - Transforms + deduplicates + searches           │    │
│  └──────────────────┬───────────────────────────────┘    │
└─────────────────────┼────────────────────────────────────┘
                      │ fetch (cached 1 hour)
                      ▼
        ┌─────────────────────────┐
        │  GitHub Raw JSON        │
        │  (External Data Source) │
        └─────────────────────────┘
```

## Local Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

### GET /api/datasets

Returns all datasets, with optional search filtering.

**Query Parameters:**
- `search` (optional) — filter by title or description (case-insensitive)
- `category` (optional) — filter by exact accessServiceCategory (case-insensitive)
- `page` (optional, default: 1) — page number
- `limit` (optional, default: 20, max: 100) — items per page

**Example Requests:**
```
GET /api/datasets
GET /api/datasets?search=covid
GET /api/datasets?category=TRE/SDE&page=1&limit=10
GET /api/datasets?search=fibrosis&page=2&limit=5
```

**Example Response:**
```json
{
  "data": [
    {
      "id": "cystic-fibrosis-patient-microbiology-cultures",
      "title": "Cystic Fibrosis Patient Microbiology Cultures",
      "description": "The UK Cystic Fibrosis Registry Culture is made...",
      "accessServiceCategory": "Varies based on project",
      "accessRights": "https://www.cysticfibrosis.org.uk/..."
    }
  ],
  "total": 978,
  "page": 1,
  "limit": 20,
  "totalPages": 49
}
```

### GET /api/datasets/:id

Returns a single dataset by its slug ID.

**Example Request:**
```
GET /api/datasets/cystic-fibrosis-patient-microbiology-cultures
```

**Example Response (200):**
```json
{
  "id": "cystic-fibrosis-patient-microbiology-cultures",
  "title": "Cystic Fibrosis Patient Microbiology Cultures",
  "description": "The UK Cystic Fibrosis Registry Culture is made...",
  "accessServiceCategory": "Varies based on project",
  "accessRights": "https://www.cysticfibrosis.org.uk/..."
}
```

**Example Response (404):**
```json
{
  "error": "Dataset not found"
}
```

## Design Decisions

### ISR at the API Layer

The external JSON is fetched with `{ next: { revalidate: 3600 } }` (1-hour ISR). This means:
- The first request fetches from GitHub and caches the result
- Subsequent requests within the hour serve the cached data instantly
- After 1 hour, the next request triggers a background revalidation
- This balances freshness with performance — the source data changes infrequently

### Server-Side Search

Search is handled by the API route (`/api/datasets?search=term`), not by filtering in the browser. This:
- Keeps the data transformation logic in one place (the API layer)
- Allows the API to be consumed by other clients with the same filtering capability
- Maintains the strict separation of concerns (frontend never touches raw data)

### Pagination

The API supports offset-based pagination via `page` and `limit` query params. This:
- Reduces payload size — only 20 items per page instead of all 978
- Works seamlessly with search and category filters
- The UI shows numbered page buttons with ellipsis for large page counts
- Limit is capped at 100 to prevent abuse

### Category Filtering

The API supports filtering by `accessServiceCategory` via the `?category=` param. The available categories are extracted server-side and passed to the client as a dropdown. Combined with search and pagination, this gives users three ways to narrow results.

### Strict Separation of Concerns

The frontend never fetches from the external GitHub URL directly. All data flows:
1. External JSON → `lib/datasets.ts` (fetch + transform)
2. `lib/datasets.ts` → API routes (serve transformed data)
3. API routes → `page.tsx` (server component, initial load)
4. API routes → `DatasetTable.tsx` (client component, search updates)

This ensures the external data source can be swapped without touching any frontend code.
# HDRUK-Datasets-Explorer
