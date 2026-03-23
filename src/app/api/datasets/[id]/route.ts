import { NextResponse } from "next/server";
import { fetchAllDatasets } from "@/lib/datasets";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const datasets = await fetchAllDatasets();
    const dataset = datasets.find((d) => d.id === params.id);

    if (!dataset) {
      return NextResponse.json(
        { error: "Dataset not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(dataset);
  } catch (error) {
    console.error("Error fetching dataset:", error);
    return NextResponse.json(
      { error: "Failed to fetch dataset" },
      { status: 500 }
    );
  }
}
