import type { LazyLocaleType } from "@quan-erp/shared-ui";

export const SampleLocaleLazy: LazyLocaleType = {
    "en-US": () => import("./locales/en-US.json"),
    "my-MM": () => import("./locales/my-MM.json"),
    "zh-CN": () => import("./locales/zh-CN.json"),
};
