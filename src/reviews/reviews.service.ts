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
import * as jwt from 'jsonwebtoken';
import { UserInitial } from 'src/schemas/user.schema';
import { Product } from 'src/products/entities/product.entity';
import { ProductDocument } from 'src/schemas/product.schema';

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
    @InjectModel(UserInitial.name) private readonly userModel: Model<UserInitial>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
  ) {}
  private reviews: ReviewEnt[] = reviews;

  async findAllReviews({ limit, page, search, product_id }: GetReviewsDto) {
    const reviews = await this.reviewModel.find({product_id: product_id}).lean().exec();

    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: ReviewEnt[] = reviews;

    // colocar os users no data
    for (let i = 0; i < data.length; i++) {
      const user = await this.userModel.findById(data[i].user_id).lean().exec();
      const product = await this.productModel.findById(data[i].product_id).lean().exec();

      data[i].product = product;
      data[i].user = user;
    }

  //  console.log(data)

    if (search) {
      const parseSearchParams = search.split(';');
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        data = fuse.search(value)?.map(({ item }) => item);
      }
    }

    const results = data.slice(startIndex, endIndex);
    const url = `/reviews?search=${search}&limit=${limit}`;
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  findReview(id: number) {
    console.log(id)
    return this.reviews.find((p) => p.id === id);
  }

  async create(createReviewDto: CreateReviewDto, token: string) {
    const extractToken = token.split(' ')[1];
    const decoded = jwt.verify(extractToken, process.env.JWT_SECRET) as any;

    const createdReview = new this.reviewModel({
      ...createReviewDto,
      user_id: decoded.id,
      updated_at: new Date(),
      created_at: new Date(),
    });

    return createdReview.save();
  }

  update(id: number, updateReviewDto: UpdateReviewDto) {
    return this.reviews[0];
  }

  delete(id: number) {
    return this.reviews[0];
  }
}
