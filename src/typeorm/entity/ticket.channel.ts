import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinColumn,
  OneToMany,
  JoinTable,
} from 'typeorm';
import TicketGroup from './ticketGroup.entity';
import TicketFund from './ticketFund.entity';
/*
 * 股票表
 * */
@Entity()
export default class TicketChannel {
  @PrimaryGeneratedColumn()
  id: number;

  /*
   * 股票板块名称
   * */
  @Column({ default: '' })
  name: string;
  /*
   * 股票板块代码
   * */
  @Column({ default: '' })
  code: string;
}
