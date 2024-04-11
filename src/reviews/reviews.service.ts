import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import Fuse from 'fuse.js';
import { paginate } from 'src/common/pagination/paginate';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { GetReviewsDto, ReviewPaginator } from './dto/get-reviews.dto';
import reviewJSON from '@db/reviews.json';
import { ReviewEnt } from './entities/review.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review } from 'src/schemas/review.schema';

const reviews = plainToClass(ReviewEnt, reviewJSON);
const options = {
  keys: ['product_id'],
  threshold: 0.3,
};
const fuse = new Fuse(reviews, options);

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private readonly reviewModel: Model<Review>,
  ) {}
  private reviews: ReviewEnt[] = reviews;

  async findAllReviews({ limit, page, search, product_id }: GetReviewsDto) {
    const reviews = await this.reviewModel.find();

   // console.log(reviews);
    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: ReviewEnt[] = this.reviews;

    if (search) {
      const parseSearchParams = search.split(';');
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        data = fuse.search(value)?.map(({ item }) => item);
      }
    }

    if (product_id) {
      data = data.filter((p) => p.product_id === Number(product_id));
    }

    const results = data.slice(startIndex, endIndex);
    const url = `/reviews?search=${search}&limit=${limit}`;
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  findReview(id: number) {
    return this.reviews.find((p) => p.id === id);
  }

  async create(createReviewDto: CreateReviewDto) {
    const createdReview = new this.reviewModel(createReviewDto);
    return createdReview.save();
  }

  update(id: number, updateReviewDto: UpdateReviewDto) {
    return this.reviews[0];
  }

  delete(id: number) {
    return this.reviews[0];
  }
}
