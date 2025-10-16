import { IsEmail, IsEnum, Length } from "class-validator";
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";
import * as bcrypt from "bcrypt";

export enum Role {
  ADMIN = "admin",
  USER = "user",
}

export enum Status {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 100 })
  @Length(3, 100)
  fullName!: string;

  @Column({ type: "date" })
  dateOfBirth!: string; //можно Date

  @Column({ type: "varchar", unique: true })
  @IsEmail()
  email!: string;

  @Column({ type: "varchar" })
  password!: string;

  @Column({
    type: "varchar",
    length: 20,
    default: Role.USER,
  })
  @IsEnum(Role)
  role!: Role;

  @Column({
    type: "varchar",
    length: 20,
    default: Status.ACTIVE,
  })
  @IsEnum(Status)
  status!: Status;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async comparePassword(candidate: string): Promise<boolean> {
    return await bcrypt.compare(candidate, this.password);
  }
}
