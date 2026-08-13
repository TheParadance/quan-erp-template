import "reflect-metadata";
import type {
    GetMigrationsType,
    IAppInstance,
    IPlugin,
    PluginExposedFeature,
    PluginMetadata,
} from "@quan-erp/shared-types";
import metadata from "../../module.metadata.json" with { type: "json" };
import { PluginRootModule } from "./feature/sample-es.module.js";
import { InitialMigration } from "./migrations/initial-migration.js";
export * from "./export.js";

export default class Plugin implements IPlugin {
    private app: IAppInstance;

    onInstall(appContext: IAppInstance): void {
        this.app = appContext;
    }

    getMigrations(): GetMigrationsType {
        return [InitialMigration];
    }

    getName(): string {
        return metadata.name;
    }

    getVersion(): string {
        return metadata.pluginVersion;
    }

    getAppModule(): PluginExposedFeature {
        return null;
    }

    getRootModule() {
        return PluginRootModule;
    }

    getMetadata(): PluginMetadata {
        return metadata as PluginMetadata;
    }

    async onUninstall(): Promise<void> {}

    onInstallError(_err: any): void {}

    onUninstallError(_err: any): void {}

    onMigrate(): void {}

    onReady(): void {}

    isReady(): boolean {
        return true;
    }

    isHealthy(): boolean {
        return true;
    }
}
