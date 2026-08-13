import type { AppRegistryState } from "@quan-erp/shared-types";



let state: AppRegistryState | null = null;
function setAppRegistry(regstry: AppRegistryState){
    state = regstry
}

function getAppRegistry(): AppRegistryState{
    return state!;
}

export {
    setAppRegistry,
    getAppRegistry
}