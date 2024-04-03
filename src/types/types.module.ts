import { Module } from '@nestjs/common';
import { TypesService } from './types.service';
import { TypesController } from './types.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TypesSchema } from 'src/schemas/type.schema';

@Module({
  imports: [
     MongooseModule.forFeature([{ name: 'Types', schema: TypesSchema }]),
  ],
  controllers: [TypesController],
  providers: [TypesService],
})
export class TypesModule {}
