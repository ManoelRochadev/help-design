import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { CreateSettingDto } from './dto/create-setting.dto';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  create(@Body() createSettingDto: CreateSettingDto) {
    return this.settingsService.create(createSettingDto);
  }

  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateSettingDto: CreateSettingDto) {
    return this.settingsService.update(id, updateSettingDto);
  }
}
