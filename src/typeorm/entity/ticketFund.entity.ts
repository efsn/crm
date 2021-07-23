import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import Ticket from './ticket.entity';
/*
 * 基金持仓信息
 * */
@Entity()
export default class TicketFund {
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
   * 基金持仓的日期
   * */
  @Column({ default: '' })
  date: string;
  /*
   * 属于哪个股票
   * */
  @ManyToOne(() => Ticket, (Ticket) => Ticket.fund, { cascade: true })
  ticket: Ticket;
}
