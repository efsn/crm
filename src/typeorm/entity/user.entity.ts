import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export default class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nickName: string;

  @Column()
  avatarUrl: string;

  @Column()
  phoneNumber: boolean;

  @Column()
  gender: string;

  @Column()
  level: string;
}
