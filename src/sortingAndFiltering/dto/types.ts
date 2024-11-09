export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum SortBy {
  PRICE = 'price',
  NAME = 'name',
  DATE = 'date',
}

export enum OrderProperty {
  NFT = 'nft',
  TOKEN = 'token',
  ME = 'me',
}

export type DataToSortType = { data: object[] };

export type PaginationArgs = {
  page?: string;
  limit?: string;
};

export type QueryArgs = {
  query?: string;
};

export type SortingArgs = {
  sortOrder?: SortOrder;
  sortBy?: SortBy;
};

export type FilterAndSortArgs = PaginationArgs & SortingArgs & QueryArgs;

export type SortDataMethod = DataToSortType & SortingArgs;

export type PaginateMethod = DataToSortType & PaginationArgs;

export type QueryMethod = DataToSortType & QueryArgs;
