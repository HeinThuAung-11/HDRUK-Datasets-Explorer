import { NextRequest, NextResponse } from "next/server";
import { fetchAllDatasets, searchDatasets } from "@/lib/datasets";
import { DatasetsResponse } from "@/types/dataset";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export async function GET(request: NextRequest) {
  try {
    const datasets = await fetchAllDatasets();
    const searchParam = request.nextUrl.searchParams.get("search");
    const categoryParam = request.nextUrl.searchParams.get("category");
    const pageParam = request.nextUrl.searchParams.get("page");
    const limitParam = request.nextUrl.searchParams.get("limit");

    let filtered =
      searchParam && searchParam.trim()
        ? searchDatasets(datasets, searchParam.trim())
        : datasets;

    if (categoryParam && categoryParam.trim()) {
      const lower = categoryParam.trim().toLowerCase();
      filtered = filtered.filter(
        (d) => d.accessServiceCategory.toLowerCase() === lower
      );
    }

    const total = filtered.length;
    const page = Math.max(1, parseInt(pageParam ?? `${DEFAULT_PAGE}`, 10) || DEFAULT_PAGE);
    const limit = Math.max(1, Math.min(100, parseInt(limitParam ?? `${DEFAULT_LIMIT}`, 10) || DEFAULT_LIMIT));
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    const response: DatasetsResponse = {
      data: paginated,
      total,
      page,
      limit,
      totalPages,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching datasets:", error);
    return NextResponse.json(
      { error: "Failed to fetch datasets" },
      { status: 500 }
    );
  }
}
