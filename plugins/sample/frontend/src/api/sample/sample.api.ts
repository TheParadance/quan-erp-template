import { withApiMetadataFetchFn } from "@quan-erp/shared-types";
import { getAxiosClient } from "../../lib/axios";
import { metadata } from "../../lib/metadata";
import type { SampleHelloDto, SampleItemDto } from "./sample.types";

const PLUGIN_PREFIX = `/${metadata.name}/sample`;

export const getSampleHelloApi = withApiMetadataFetchFn({
    api: { method: "GET", url: `${PLUGIN_PREFIX}/` },
    fetchFn: async (): Promise<SampleHelloDto> => {
        const response = await getAxiosClient().get(`${PLUGIN_PREFIX}/`);
        return response.data.payload;
    },
});

export const getSampleItemsApi = withApiMetadataFetchFn({
    api: { method: "GET", url: `${PLUGIN_PREFIX}/items` },
    fetchFn: async (): Promise<SampleItemDto[]> => {
        const response = await getAxiosClient().get(`${PLUGIN_PREFIX}/items`);
        return response.data.payload;
    },
});
