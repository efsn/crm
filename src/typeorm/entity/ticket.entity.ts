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
export default class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  /*
   * 股票名称
   * */
  @Column({ default: '' })
  name: string;
  /*
   * 股票代码
   * */
  @Column({ default: '' })
  code: string;
  /*
   * 近期是否有解禁
   * */
  @Column({ default: false })
  isBan: boolean;
  /*
   * 股票优劣等级
   * */
  @Column({ default: 0 })
  level: number;
  /*
   * 股票描述
   * */
  @Column({ default: '' })
  description: string;
  /*
   * 类型，属于具体板块和概念
   * */
  @ManyToMany(() => TicketGroup, (TicketGroup) => TicketGroup.tickets)
  @JoinTable()
  ticketGroups: TicketGroup[];
  /*
   * 基金持仓信息
   * */
  @OneToMany(() => TicketFund, (TicketFund) => TicketFund.ticket)
  @JoinColumn()
  fund: TicketFund[];
}
