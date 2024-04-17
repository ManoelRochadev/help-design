import { Type } from 'class-transformer';

export class CoreEntity {
  id?: number | string;
  @Type(() => Date)
  created_at: Date;
  @Type(() => Date)
  updated_at: Date;
}
