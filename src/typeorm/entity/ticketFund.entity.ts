import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import Ticket from './ticket.entity';

@Entity()
export default class TicketFund {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fund: number;

  @Column()
  sort: number;

  @Column({
    type: Date,
  })
  date: string;

  @ManyToOne(() => Ticket, (Ticket) => Ticket.fund, { cascade: true })
  ticket: Ticket;
}
