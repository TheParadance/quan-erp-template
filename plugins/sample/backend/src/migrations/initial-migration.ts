import { IDatabaseMigration } from "@quan-erp/shared-types";
import { QueryRunner } from "typeorm";

export class InitialMigration implements IDatabaseMigration {
    async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`
            CREATE TABLE "sample_es_sample" (
                "createDate" TIMESTAMP NOT NULL DEFAULT now(),
                "updateDate" TIMESTAMP NOT NULL DEFAULT now(),
                "deleteDate" TIMESTAMP,
                "version" integer NOT NULL DEFAULT '0',
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                CONSTRAINT "PK_sample_es_sample" PRIMARY KEY ("id")
            )
        `);
    }

    async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "sample_es_sample"`);
    }

    getName(): string {
        return "initial";
    }

    getSource(): { plugin: string; name: string } {
        return {
            plugin: "default",
            name: "default",
        };
    }
}
