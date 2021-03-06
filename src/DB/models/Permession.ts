import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Menu } from "./Menu";
import { RoleAndPermession } from "./RoleAndPermession";

@Entity()
export class Permession {

    @PrimaryGeneratedColumn()
    Id: number;
    @Column()
    PermessionKey: string;
    @Column({ type: 'nvarchar', length: 50, nullable: true })
    ParentKey: string;
    @Column({ type: 'bit' })
    IsParent: string;
    @Column({ name: 'menuId', nullable: true })
    MenuId: number;
    @OneToOne(() => Menu, { nullable: true })
    @JoinColumn()
    Menu: Menu;
    @OneToMany(() => RoleAndPermession, roleAndPermession => roleAndPermession.Permession)
    RoleAndPermession: RoleAndPermession[];

}