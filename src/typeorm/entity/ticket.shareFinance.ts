import { Entity, Column, OneToMany, PrimaryColumn } from 'typeorm';
import TicketShare from './ticket.share';
/*
 * 股票表
 * */
@Entity()
export default class TicketShareFinance {
  @PrimaryColumn()
  date: number;

  @Column({ default: 0 })
  value: number;
  @OneToMany(() => TicketShare, (TicketShare) => TicketShare.finances, {
    cascade: true,
  })
  share: TicketShare;
}
