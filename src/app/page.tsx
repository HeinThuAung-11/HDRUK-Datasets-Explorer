import { headers } from "next/headers";
import DatasetTable from "@/components/DatasetTable";
import { DatasetsResponse } from "@/types/dataset";

export default async function Home() {
  let data: DatasetsResponse = { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
  let categories: string[] = [];
  let error = false;

  try {
    const headersList = headers();
    const host = headersList.get("host") ?? "localhost:3000";
    const protocol = headersList.get("x-forwarded-proto") ?? "http";
    const baseUrl = `${protocol}://${host}`;

    const [datasetsRes, allRes] = await Promise.all([
      fetch(`${baseUrl}/api/datasets?page=1&limit=20`, { cache: "no-store" }),
      fetch(`${baseUrl}/api/datasets?limit=10000`, { cache: "no-store" }),
    ]);

    if (!datasetsRes.ok) {
      throw new Error(`API responded with ${datasetsRes.status}`);
    }

    data = await datasetsRes.json();

    if (allRes.ok) {
      const allData: DatasetsResponse = await allRes.json();
      const uniqueCategories = new Set(
        allData.data.map((d) => d.accessServiceCategory).filter(Boolean)
      );
      categories = Array.from(uniqueCategories).sort();
    }
  } catch (e) {
    console.error("Failed to load datasets:", e);
    error = true;
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          HDRUK Datasets Explorer
        </h1>
        <p className="mt-2 text-gray-600">
          Browse and search health data research datasets
        </p>
      </div>

      {error ? (
        <div className="rounded-lg bg-red-50 border border-red-200 p-6 text-center">
          <p className="text-red-800 font-medium">
            Unable to load datasets. Please try again later.
          </p>
        </div>
      ) : (
        <DatasetTable initialData={data} categories={categories} />
      )}
    </main>
  );
}
