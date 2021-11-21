import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne
} from 'typeorm';
import { Order } from './Order';

@Entity()
export class TelegramOrder {
  @PrimaryGeneratedColumn()
  id?: string;

  @Column({ nullable: true })
  TelegramId?: number;

  @Column({ length: 30, nullable: true })
  Username?: string;

  @Column({ length: 30, nullable: true })
  FirstName?: string;

  @Column({ length: 30, nullable: true })
  LastName?: string;

  @Column({ length: 30, nullable: true })
  PhoneNumber?: string;

  @Column({ length: 30, nullable: true })
  ContactPhoneNumber?: string;

  @Column({ length: 1000, nullable: true })
  Location?: string;

  // @Column({ type: 'text', nullable: true })
  // SelectedProducts?: string;

  // @Column({ type: 'text', nullable: true })
  // OrderDetails?: string;

  @Column({ length: 1000, nullable: true })
  Address?: string;

  @OneToOne(() => Order, order => order.TelegramOrder)
  Order?: Order;
}