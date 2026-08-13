import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { getSampleHelloApi, getSampleItemsApi } from "./sample.api";
import { SAMPLE_QUERY_KEYS } from "./sample.constants";
import type { SampleHelloDto, SampleItemDto } from "./sample.types";

export function useSampleHelloQuery(
    option?: Omit<UseQueryOptions<SampleHelloDto>, "queryFn" | "queryKey">,
) {
    return useQuery({
        queryKey: SAMPLE_QUERY_KEYS.hello,
        queryFn: () => getSampleHelloApi.fetchFn(),
        ...(option || {}),
    });
}

export function useSampleItemsQuery(
    option?: Omit<UseQueryOptions<SampleItemDto[]>, "queryFn" | "queryKey">,
) {
    return useQuery({
        queryKey: SAMPLE_QUERY_KEYS.items,
        queryFn: () => getSampleItemsApi.fetchFn(),
        ...(option || {}),
    });
}
