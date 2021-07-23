import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import Ticket from './ticket.entity';

@Entity()
export default class TicketGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => Ticket, (Ticket) => Ticket.ticketGroups, { cascade: true })
  tickets: Ticket[];
}
