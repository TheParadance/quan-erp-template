import { BaseEntity } from "@quan-erp/shared-backend-core";
import "reflect-metadata";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import metadata from "../../../module.metadata.json" with { type: "json" };

@Entity(`${metadata.name}_sample`)
export class SampleEntity extends BaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({ type: "varchar" })
    name: string;
}
