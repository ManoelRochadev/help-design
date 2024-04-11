import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TagSchema } from 'src/schemas/tag.schema';
import { ProductSchema } from 'src/schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Tags', schema: TagSchema }, {name: 'Product', schema: ProductSchema}])
  ],
  controllers: [TagsController],
  providers: [TagsService],
})
export class TagsModule {}
