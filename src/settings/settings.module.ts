import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingsSchema } from 'src/schemas/settings.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Settings', schema: SettingsSchema }]),
  ],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
