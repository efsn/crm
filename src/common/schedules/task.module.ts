import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import TaskService from './task.service';
import TicketModule from '../../controllers/ticket/ticket.module';

@Module({
  imports: [ScheduleModule.forRoot(), TicketModule],
  providers: [TaskService],
})
export default class TaskModule {}
