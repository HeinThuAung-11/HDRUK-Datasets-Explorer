export interface RawDataset {
  metadata?: {
    summary?: {
      title?: string;
      abstract?: string;
    };
    accessibility?: {
      access?: {
        accessServiceCategory?: string;
        accessRights?: string;
      };
    };
  };
}

export interface DatasetSummary {
  id: string;
  title: string;
  description: string;
  accessServiceCategory: string;
  accessRights: string;
}

export interface DatasetsResponse {
  data: DatasetSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
