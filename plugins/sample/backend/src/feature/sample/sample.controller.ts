import {
    APIInfo,
    AuditLogMiddleware,
    AuthenticatedUserOnly,
    CheckAPIPermission,
    Controller,
    Get,
    Inject,
    JsonContentType,
    JWTAuthorizationHeader,
    ResponseDto,
} from "@quan-erp/shared-backend-core";
import metadata from "../../../../module.metadata.json" with { type: "json" };
import { SampleService } from "./sample.service.js";

@Controller(`/${metadata.name}/sample`)
export class SampleController {
    @Inject(SampleService)
    service: SampleService;

    @Get("/")
    @AuthenticatedUserOnly()
    @CheckAPIPermission()
    @AuditLogMiddleware("View sample hello")
    @APIInfo({
        shortDescription: "Sample hello",
        description: "Returns a simple hello payload from the sample plugin",
        contentType: JsonContentType,
        responseDto: ResponseDto,
        headers: JWTAuthorizationHeader,
    })
    getHello() {
        return ResponseDto.ok(this.service.getHello());
    }

    @Get("/items")
    @AuthenticatedUserOnly()
    @CheckAPIPermission()
    @AuditLogMiddleware("List sample items")
    @APIInfo({
        shortDescription: "List sample items",
        description: "Returns sample entity rows",
        contentType: JsonContentType,
        responseDto: ResponseDto,
        headers: JWTAuthorizationHeader,
    })
    async listItems() {
        return ResponseDto.ok(await this.service.listSamples());
    }
}
