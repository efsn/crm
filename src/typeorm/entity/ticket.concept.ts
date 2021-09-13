import {
  Entity,
  Column,
  PrimaryColumn,
  OneToMany,
  JoinColumn,
  ManyToMany,
} from 'typeorm';
import TicketShare from './ticket.share';
/*
 * 股票表
 * */
@Entity()
export default class TicketConcept {
  /*
   * 股票板块名称
   * */
  @Column({ default: '' })
  name: string;
  /*
   * 股票板块代码
   * */
  @PrimaryColumn()
  code: string;
  /*
   * 是否展示
   * */
  @Column({ default: 1 })
  isShow: number;

  @ManyToMany(() => TicketShare, (TicketShare) => TicketShare.concepts)
  shares: TicketShare[];
}
