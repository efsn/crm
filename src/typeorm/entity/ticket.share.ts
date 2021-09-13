import {
  Entity,
  Column,
  JoinColumn,
  OneToMany,
  ManyToOne,
  PrimaryColumn,
  JoinTable,
  ManyToMany,
} from 'typeorm';

import TicketConcept from './ticket.concept';
import TicketShareFinance from './ticket.shareFinance';
/*
 * 股票表
 * */
@Entity()
export default class TicketShare {
  /*
   * 股票名称
   * */
  @Column({ default: '' })
  name: string;
  /*
   * 股票代码
   * */
  @PrimaryColumn()
  code: string;

  @ManyToMany(() => TicketConcept, (TicketConcept) => TicketConcept.shares, {
    cascade: true,
  })
  @JoinTable()
  concepts: TicketConcept[];

  @OneToMany(
    () => TicketShareFinance,
    (TicketShareFinance) => TicketShareFinance.share,
  )
  @JoinColumn()
  finances: TicketShareFinance[];
}
