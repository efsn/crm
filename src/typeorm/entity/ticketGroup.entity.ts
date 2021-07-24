import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import Ticket from './ticket.entity';
import TicketGroupFund from './ticketGroupFund.entity';
/*
 * 股票类型(板块、概念)
 * */
@Entity()
export default class TicketGroup {
  @PrimaryGeneratedColumn()
  id: number;
  /*
   * 类型名称
   * */
  @Column()
  name: string;
  /*
   * 包含的类型
   * */
  @ManyToMany(() => Ticket, (Ticket) => Ticket.ticketGroups, { cascade: true })
  tickets: Ticket[];
  /*
   * 类型的基金持仓
   * */
  @OneToMany(() => TicketGroupFund, (TicketGroupFund) => TicketGroupFund.group)
  @JoinColumn()
  fund: TicketGroupFund[];
}
