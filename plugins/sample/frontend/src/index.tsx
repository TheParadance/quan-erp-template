import type { AppRegistryState, PluginModule } from "@quan-erp/shared-types";
import { PluginAPI } from "@quan-erp/shared-frontend-core";
import { IconParkMenuTabIcon, MenuTab } from "@quan-erp/shared-ui";
import { Bookmark, Home } from "@icon-park/react";
import "./index.css";
import { setAppRegistry } from "./lib/app-registry";
import { setAxiosClient } from "./lib/axios";
import { metadata } from "./lib/metadata";
import { APINames } from "./export";
import { getSampleHelloApi, getSampleItemsApi } from "./api/sample/sample.api";
import { PageOne } from "./page/page-1.page";
import { PageTwo } from "./page/page-2.page";
import { SampleLocaleLazy } from "./page/sample.locale";

const Plugin: PluginModule = {
    register(AppRegistry: AppRegistryState) {
        setAppRegistry(AppRegistry);
        setAxiosClient(AppRegistry.getAxiosClient());

        PluginAPI.expose(metadata.name, APINames.SampleAPI, {});

        AppRegistry.menu.add({
            name: (
                <MenuTab
                    pluginName={metadata.name}
                    icon={
                        <IconParkMenuTabIcon
                            pluginName={metadata.name}
                            icon={Home}
                        />
                    }
                    labelKey="sample-es"
                    locale={SampleLocaleLazy}
                />
            ),
            pluginName: metadata.name,
            children: [
                {
                    name: (
                        <MenuTab
                            pluginName={metadata.name}
                            icon={
                                <IconParkMenuTabIcon
                                    pluginName={metadata.name}
                                    icon={Bookmark}
                                />
                            }
                            labelKey="page-1"
                            locale={SampleLocaleLazy}
                        />
                    ),
                    path: `/${metadata.name}/page-1`,
                    requiredApis: [getSampleHelloApi, getSampleItemsApi],
                },
                {
                    name: (
                        <MenuTab
                            pluginName={metadata.name}
                            icon={
                                <IconParkMenuTabIcon
                                    pluginName={metadata.name}
                                    icon={Bookmark}
                                />
                            }
                            labelKey="page-2"
                            locale={SampleLocaleLazy}
                        />
                    ),
                    path: `/${metadata.name}/page-2`,
                },
            ],
        });

        AppRegistry.route.add({
            path: `/${metadata.name}/page-1`,
            element: <PageOne />,
        });

        AppRegistry.route.add({
            path: `/${metadata.name}/page-2`,
            element: <PageTwo />,
        });
    },
};

export default Plugin;
