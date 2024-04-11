import { SortOrder } from 'src/common/dto/generic-conditions.dto';
import { PaginationArgs } from 'src/common/dto/pagination-args.dto';
import { Paginator } from 'src/common/dto/paginator.dto';
import { ReviewEnt } from '../entities/review.entity';

export class ReviewPaginator extends Paginator<ReviewEnt> {
  data: ReviewEnt[];
}

export class GetReviewsDto extends PaginationArgs {
  orderBy?: QueryReviewsOrderByColumn;
  sortedBy?: SortOrder;
  search?: string;
  product_id?: string;
}

export enum QueryReviewsOrderByColumn {
  NAME = 'NAME',
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
}
