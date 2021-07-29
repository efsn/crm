import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
/*
 * 基金持仓前 150 的总金额
 * 用于当前基金是否在抛售，基金抛售及时逃跑
 * */
@Entity()
export default class TicketFundTotal {
  @PrimaryGeneratedColumn()
  id: number;
  /*
   * 持仓的金额
   * */
  @Column()
  fund: number;
  /*
   * 基金持仓的日期
   * */
  @Column({ default: '' })
  date: string;
}
