import { RawDataset, DatasetSummary } from "@/types/dataset";

const EXTERNAL_URL =
  "https://raw.githubusercontent.com/HDRUK/hackathon-entity-linkage/refs/heads/dev/fe-implement/app/data/all_datasets.json";

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

let cachedDatasets: DatasetSummary[] | null = null;
let cacheTimestamp = 0;

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function transformDataset(raw: RawDataset): DatasetSummary {
  const title = raw.metadata?.summary?.title ?? "Untitled";
  return {
    id: slugify(title),
    title,
    description: raw.metadata?.summary?.abstract ?? "",
    accessServiceCategory:
      raw.metadata?.accessibility?.access?.accessServiceCategory ?? "Unknown",
    accessRights: raw.metadata?.accessibility?.access?.accessRights ?? "",
  };
}

export async function fetchAllDatasets(): Promise<DatasetSummary[]> {
  const now = Date.now();

  if (cachedDatasets && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedDatasets;
  }

  const res = await fetch(EXTERNAL_URL, { cache: "no-store" });

  if (!res.ok) {
    if (cachedDatasets) return cachedDatasets; // serve stale on error
    throw new Error(`Failed to fetch datasets: ${res.status}`);
  }

  const rawData: RawDataset[] = await res.json();

  const seen = new Map<string, DatasetSummary>();
  for (const raw of rawData) {
    const dataset = transformDataset(raw);
    if (!seen.has(dataset.id)) {
      seen.set(dataset.id, dataset);
    }
  }

  cachedDatasets = Array.from(seen.values());
  cacheTimestamp = now;

  return cachedDatasets;
}

export function searchDatasets(
  datasets: DatasetSummary[],
  query: string
): DatasetSummary[] {
  const lower = query.toLowerCase();
  return datasets.filter(
    (d) =>
      d.title.toLowerCase().includes(lower) ||
      d.description.toLowerCase().includes(lower)
  );
}
