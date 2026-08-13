import type { PluginMetadata } from "@quan-erp/shared-types";
import rawMetadata from "../../../module.metadata.json" with { type: "json" };

export const metadata = rawMetadata as PluginMetadata;
