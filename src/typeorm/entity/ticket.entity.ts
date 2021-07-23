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

@Entity()
export default class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  code: string;

  @Column({ default: false })
  isBan: boolean;

  @Column()
  level: number;

  @Column()
  description: string;

  @ManyToMany(() => TicketGroup, (TicketGroup) => TicketGroup.tickets)
  @JoinTable()
  ticketGroups: TicketGroup[];

  @OneToMany(() => TicketFund, (TicketFund) => TicketFund.ticket)
  @JoinColumn()
  fund: TicketFund[];
}
