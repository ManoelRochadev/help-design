import { Module } from '@nestjs/common';
import { AbusiveReportsController } from './reports.controller';
import { AbusiveReportService } from './reports.service';
import { ReviewController } from './reviews.controller';
import { ReviewService } from './reviews.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewSchema } from 'src/schemas/review.schema';
import { UserInitial, UserSchema } from 'src/schemas/user.schema';
import { ProductSchema } from 'src/schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Review',
        schema: ReviewSchema,
      },
      {
        name: UserInitial.name,
        schema: UserSchema,
      },
      {
        name: 'Product',
        schema: ProductSchema
      }
    ]),
  ],
  controllers: [ReviewController, AbusiveReportsController],
  providers: [ReviewService, AbusiveReportService],
})
export class ReviewModule {}
