import type { AppRegistryState } from "@quan-erp/shared-types";

let state: AppRegistryState | null = null;

export function setAppRegistry(registry: AppRegistryState) {
    state = registry;
}

export function getAppRegistry(): AppRegistryState {
    return state!;
}
