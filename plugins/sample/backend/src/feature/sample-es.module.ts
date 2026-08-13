import { Module, OnInit } from "@quan-erp/shared-backend-core";
import metadata from "../../../module.metadata.json" with { type: "json" };
import { SampleEntity } from "../schema/sample.entity.js";
import { SampleController } from "./sample/sample.controller.js";
import { SampleService } from "./sample/sample.service.js";

@Module({
    name: metadata.name,
    providers: [SampleService],
    controllers: [SampleController],
    entities: [
        {
            plugin: "default",
            entities: [SampleEntity],
        },
    ],
})
export class PluginRootModule {
    @OnInit()
    init() {
        // Sample plugin root module ready
    }
}
