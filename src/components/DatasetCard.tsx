import { memo } from "react";
import { DatasetSummary } from "@/types/dataset";
import { ExternalLinkIcon } from "./Icons";

const TRUNCATE_LENGTH = 150;

function Description({
  dataset,
  isExpanded,
  onToggleExpand,
}: {
  dataset: DatasetSummary;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
}) {
  const isLong = dataset.description.length > TRUNCATE_LENGTH;

  if (!isLong) return <span>{dataset.description}</span>;

  return (
    <span>
      {isExpanded
        ? dataset.description
        : `${dataset.description.slice(0, TRUNCATE_LENGTH)}...`}
      <button
        onClick={() => onToggleExpand(dataset.id)}
        className="ml-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        {isExpanded ? "Show less" : "Show more"}
      </button>
    </span>
  );
}

function AccessLink({ url }: { url: string }) {
  if (!url) return <span className="text-gray-400">N/A</span>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:text-blue-800 inline-flex items-center text-sm"
    >
      View
      <ExternalLinkIcon />
    </a>
  );
}

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="inline-block px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
      {category}
    </span>
  );
}

interface DatasetCardProps {
  dataset: DatasetSummary;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
}

const DatasetCard = memo(function DatasetCard({
  dataset,
  isExpanded,
  onToggleExpand,
}: DatasetCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-2">{dataset.title}</h3>
      <p className="text-sm text-gray-600 mb-3">
        <Description
          dataset={dataset}
          isExpanded={isExpanded}
          onToggleExpand={onToggleExpand}
        />
      </p>
      <div className="flex items-center justify-between">
        <CategoryBadge category={dataset.accessServiceCategory} />
        <AccessLink url={dataset.accessRights} />
      </div>
    </div>
  );
});

interface DatasetRowProps {
  dataset: DatasetSummary;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
}

const DatasetRow = memo(function DatasetRow({
  dataset,
  isExpanded,
  onToggleExpand,
}: DatasetRowProps) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 font-medium text-gray-900 text-sm">
        {dataset.title}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        <Description
          dataset={dataset}
          isExpanded={isExpanded}
          onToggleExpand={onToggleExpand}
        />
      </td>
      <td className="px-4 py-3">
        <CategoryBadge category={dataset.accessServiceCategory} />
      </td>
      <td className="px-4 py-3">
        <AccessLink url={dataset.accessRights} />
      </td>
    </tr>
  );
});

export { Description, AccessLink, CategoryBadge, DatasetRow };
export default DatasetCard;
