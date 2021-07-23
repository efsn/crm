import { Controller, Post } from '@nestjs/common';

@Controller('member/user')
export default class userController {
  @Post('register')
  async register() {}
}
