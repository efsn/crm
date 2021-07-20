import { Controller, Get } from '@nestjs/common';
import ConfigService from '../../common/configs/config.service';

@Controller('demo/one')
export default class DemoOneController {
  constructor(private readonly config: ConfigService) {}
  @Get('show')
  show() {
    return 'show';
  }
}
