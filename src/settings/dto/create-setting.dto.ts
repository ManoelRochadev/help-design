import { OmitType } from '@nestjs/swagger';
import { Setting } from '../entities/setting.entity';
import { set } from 'mongoose';

export class CreateSettingDto extends Setting {
  
}
