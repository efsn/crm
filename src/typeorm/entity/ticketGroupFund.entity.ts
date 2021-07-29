import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import Ticket from './ticket.entity';
import TicketGroup from './ticketGroup.entity';
/*
 * 板块持仓信息
 * */
@Entity()
export default class TicketGroupFund {
  @PrimaryGeneratedColumn()
  id: number;
  /*
   * 持仓的金额
   * */
  @Column()
  fund: number;
  /*
   * 持仓中排名
   * */
  @Column()
  sort: number;
  /*
   * 持仓中个数
   * */
  @Column()
  total: number;
  /*
   * 基金持仓的日期
   * */
  @Column({ default: '' })
  date: string;
  /*
   * 属于哪个类型
   * */
  @ManyToOne(() => TicketGroup, (TicketGroup) => TicketGroup.fund, {
    cascade: true,
  })
  group: TicketGroup;
}
