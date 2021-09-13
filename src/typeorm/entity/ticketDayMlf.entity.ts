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
 * 每日逆回购
 * */
@Entity()
export default class TicketDayMlf {
  @PrimaryGeneratedColumn()
  id: number;

  /*
   * 结束日期
   * */
  @Column()
  recovery: string;
  /*
   * 发放日起
   * */
  @Column()
  start: string;
  /*
   * 金额
   * */
  @Column()
  value: number;
  /*
   * 储备金
   * */
  @Column({ default: false })
  tips: boolean;
  /*
   * 财政闲置金
   * */
  @Column({ default: '' })
  type: string;
}
