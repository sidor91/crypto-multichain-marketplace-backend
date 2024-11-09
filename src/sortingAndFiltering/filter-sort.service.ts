import { Brackets, SelectQueryBuilder } from 'typeorm';

import { Injectable } from '@nestjs/common';

import { ApplyFiltersDto } from './dto/apply-filters.dto';
import * as t from './dto/types';

@Injectable()
export class FilterSortService {
  applyFiltersForAssets(dto: ApplyFiltersDto, dataToSort: object[]) {
    const { sortBy, page, limit, query } = dto;
    const sortOrder = dto.sortOrder || t.SortOrder.DESC;
    let filteredData = [...dataToSort];
    let data: any[] = [];
    let totalElements: number = dataToSort.length;

    if (sortBy) {
      filteredData = this.sortData({
        data: filteredData,
        sortBy,
        sortOrder,
      });
    }

    if (query) {
      filteredData = this.search({ data: filteredData, query });
      totalElements = filteredData.length;
    }

    if (page && limit) {
      data = this.paginate({ data: filteredData, page, limit });
    } else {
      data = filteredData;
    }

    return { data, totalElements };
  }

  applyFiltersForOrders({
    queryBuilder,
    dto,
    orderProperty,
    isTransactions = false,
  }: {
    queryBuilder: SelectQueryBuilder<any>;
    dto: ApplyFiltersDto;
    orderProperty: t.OrderProperty;
    isTransactions?: boolean;
  }) {
    const { sortBy, query, page, limit } = dto;
    const sortOrder = dto.sortOrder || t.SortOrder.DESC;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    if (orderProperty === t.OrderProperty.ME) {
      if (sortBy === t.SortBy.NAME) {
        queryBuilder
          .orderBy(`nft.name`, sortOrder)
          .addOrderBy(`token.name`, sortOrder)
          .addOrderBy(`nft.address`, sortOrder)
          .addOrderBy(`token.address`, sortOrder);
      }

      if (query) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where(`nft.name ILIKE :name`, { name: `%${query}%` })
              .orWhere(`token.name ILIKE :name`, { name: `%${query}%` })
              .orWhere(`token.address ILIKE :address`, {
                address: `%${query}%`,
              })
              .orWhere(`nft.address ILIKE :address`, {
                address: `%${query}%`,
              });
          }),
        );
      }
    } else if (
      orderProperty === t.OrderProperty.NFT ||
      orderProperty === t.OrderProperty.TOKEN
    ) {
      if (sortBy === t.SortBy.NAME) {
        queryBuilder
          .orderBy(`${orderProperty}.name`, sortOrder)
          .addOrderBy(`${orderProperty}.address`, sortOrder);
      }

      if (query) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where(`${orderProperty}.name ILIKE :name`, {
              name: `%${query}%`,
            }).orWhere(`${orderProperty}.address ILIKE :address`, {
              address: `%${query}%`,
            });
          }),
        );
      }
    }

    if (sortBy === t.SortBy.PRICE) {
      const sortingProperty =
        orderProperty === t.OrderProperty.ME
          ? `order.offer_price`
          : `order.price_per_token`;
      queryBuilder.orderBy(sortingProperty, sortOrder);
    }

    if (sortBy === t.SortBy.DATE || !sortBy) {
      const orderByQuery = isTransactions
        ? `transactions.created_at`
        : `order.created_at`;
      queryBuilder.orderBy(orderByQuery, sortOrder);
    }

    if (skip >= 0 && take > 0) {
      queryBuilder.skip(skip).take(take);
    } else {
      queryBuilder.skip(0).take(10);
    }

    return queryBuilder;
  }

  sortData(args: t.SortDataMethod) {
    const { sortBy, data } = args;

    if (sortBy === t.SortBy.PRICE) {
      return this.byPrice(args);
    } else if (sortBy === t.SortBy.NAME) {
      return this.byName(args);
    } else {
      return data;
    }
  }

  byPrice(args: t.SortDataMethod) {
    const { sortOrder, data } = args;

    if (data.length <= 1) return data;

    return data.sort((a: any, b: any) => {
      const priceA = a.price_usdt;
      const priceB = b.price_usdt;
      if (sortOrder === t.SortOrder.ASC) {
        return priceA - priceB;
      } else {
        return priceB - priceA;
      }
    });
  }

  byName(args: t.SortDataMethod) {
    const { sortOrder, data } = args;
    if (data.length <= 1) return data;

    try {
      return data.sort((a: any, b: any) => {
        const nameA =
          a.name?.trim().toLowerCase() ||
          a.nft_name?.trim().toLowerCase() ||
          '';
        const nameB =
          b.name?.trim().toLowerCase() ||
          b.nft_name?.trim().toLowerCase() ||
          '';

        if (sortOrder === t.SortOrder.ASC) {
          if (nameA < nameB) return -1;
          if (nameA > nameB) return 1;
          return 0;
        } else {
          if (nameA > nameB) return -1;
          if (nameA < nameB) return 1;
          return 0;
        }
      });
    } catch (error) {
      console.log(error);
      return data;
    }
  }

  paginate(args: t.PaginateMethod) {
    const { page, limit, data } = args;

    const numberedPage = Number(page);
    const numberedLimit = Number(limit);

    if (!page || !limit || numberedPage < 0 || numberedLimit <= 0) {
      return data.slice(0, 10);
    }

    const startIndex = (numberedPage - 1) * numberedLimit;
    const endIndex = startIndex + numberedLimit;

    return data.slice(startIndex, endIndex);
  }

  search(args: t.QueryMethod) {
    const { data, query } = args;

    if (!query) return data;

    const loweredQuery = query.toLowerCase();

    return data.filter((item: any) => {
      const name = item.nft_name || item.name || '';
      const address =
        item.collection_address?._value || item.token_address?._value || '';
      return (
        name.trim().toLowerCase().includes(loweredQuery) ||
        address.trim().toLowerCase().includes(loweredQuery)
      );
    });
  }
}
