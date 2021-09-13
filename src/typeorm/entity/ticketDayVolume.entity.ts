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
 * 上证指数每日成交量
 * */
@Entity()
export default class TicketDayVolumeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /*
   * 成交额
   * */
  @Column({ type: 'float' })
  volume;
  /*
   * 换手率
   * */
  @Column({ type: 'float' })
  change;
  /*
   * 时间
   * */
  @Column({ default: '' })
  date: string;
  /*
   * 涨跌
   * */
  @Column({ type: 'float' })
  value;
}
