import { Env, InjectEnv, Module, OnAllModuleLoaded, OnInit, InjectAppInstance, ICache, CacheClient } from "@quan-erp/shared-backend-core";
import { InjectPluginServiceEventManager, IPluginServiceEventManager } from "@quan-erp/shared-backend-core";
import metadata from '../../../module.metadata.json' with { type: 'json' }
import { IAppInstance } from "@quan-erp/shared-types";
import { TestFeature } from "./test-feature/test-feature.controller.js";



@Module({
    name: metadata.name,
    providers: [
    ],
    controllers: [
        TestFeature
    ],
    entities: [
        {
            plugin: 'default',
            entities: [
            ],
        }
    ]
})
export class PluginRootModule {

    @InjectEnv()
    env: Env

    @InjectPluginServiceEventManager()
    pluginServiceEventManager: IPluginServiceEventManager


    @InjectAppInstance()
    appInstance: IAppInstance


    @CacheClient("default", "publisher")
    cache: ICache


    @OnInit()
    async init() {
        this.env.set("", "")

        await this.env.sync()
    }



    @OnAllModuleLoaded()
    async loaded() {
        // console.log('my-accounting on all module loaded')
        // this.pluginServiceEventManager.register({
        //     eventName: 'my-accounting.update',
        //     callback: ({ fromPluginName, dataSourceManager, data }) => {
        //         console.log(`recieve event in my-accounting from [${fromPluginName}] [${data}]`)
        //     }
        // })

        // await this.pluginServiceEventManager.emit({
        //     'eventName': 'sale.order.create',
        //     data: {},
        //     dataSourceManager: [
        //         {
        //             name: '',
        //             pluginName: '',
        //             sourceManager: manager
        //         }
        //     ]
        // })

        // dynamic import other plugin backend code
        // try {
        //     const pkg: typeof import("@quan-erp-plugins/payment-method-backend") = await import("@quan-erp-plugins/payment-method-backend")
        //     const cls = pkg.PaymentMethodService
        //     await this.appInstance.findInstance(cls, "payment-method", ContainerRegistryManager.DEFAULT_NAME).create({
        //         data: {
        //             name: 'TEST',
        //             metadata: {},
        //         }
        //     })
        // }catch(e){
        //     console.error(e)
        // }


        // this.cache.on({
        //     type: 'delete',
        //     keys: ['customer', 'customer*'],
        //     keysToDelete: ['sale-and-purchase']
        // })
    }
}