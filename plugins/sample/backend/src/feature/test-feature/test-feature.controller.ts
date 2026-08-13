import { Controller, Get, ResponseDto } from "@quan-erp/shared-backend-core";

@Controller('/test')
export class TestFeature {
    @Get('/')
    get() {
        console.log('test10')
        return ResponseDto.ok({
            message: '4'
        })
    }
}