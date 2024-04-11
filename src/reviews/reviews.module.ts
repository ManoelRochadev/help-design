import { Module } from '@nestjs/common';
import { AbusiveReportsController } from './reports.controller';
import { AbusiveReportService } from './reports.service';
import { ReviewController } from './reviews.controller';
import { ReviewService } from './reviews.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewSchema } from 'src/schemas/review.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Review',
        schema: ReviewSchema,
      },
    ]),
  ],
  controllers: [ReviewController, AbusiveReportsController],
  providers: [ReviewService, AbusiveReportService],
})
export class ReviewModule {}
