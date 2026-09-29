import { BUILTIN_ENTITIES, CORE_ENTITIES } from "@quan-erp/shared-backend-core";
import { DataSource } from "typeorm";
import { SampleEntity } from "../schema/sample.entity.js";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "",
    password: "",
    database: "",
    entities: [...CORE_ENTITIES,...BUILTIN_ENTITIES, SampleEntity],
});
