import { DataSourceManager, InjectDatabaseSource, Service } from "@quan-erp/shared-backend-core";
import { DataSource } from "typeorm";
import { SampleEntity } from "../../schema/sample.entity.js";

@Service()
export class SampleService {
    @InjectDatabaseSource(DataSourceManager.DEFAULT_PLUGIN)
    source: DataSource;

    async listSamples() {
        return this.source.getRepository(SampleEntity).find({
            order: { id: "ASC" },
        });
    }

    getHello() {
        return {
            message: "Hello from sample-es",
        };
    }
}
