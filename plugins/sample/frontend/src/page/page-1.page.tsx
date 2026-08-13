import {
    EmptyState,
    LoadingState,
    Page,
    PageContent,
    PageNavTitle,
    PageTitle,
    useLazyLocaleTranslation,
} from "@quan-erp/shared-ui";
import { useSampleHelloQuery, useSampleItemsQuery } from "../api/sample/sample.queries";
import { metadata } from "../lib/metadata";
import { SampleLocaleLazy } from "./sample.locale";

export function PageOne() {
    const translation = useLazyLocaleTranslation(SampleLocaleLazy);
    const helloQuery = useSampleHelloQuery();
    const itemsQuery = useSampleItemsQuery();

    return (
        <Page
            pluginName={metadata.name}
            navMenu={{
                menuTitle: (
                    <PageNavTitle>
                        {translation.get("page-1-title", "Sample page 1")}
                    </PageNavTitle>
                ),
                leadingBackButton: true,
            }}
            className="w-full h-full overflow-y-auto"
        >
            <PageTitle>
                <div className="flex items-center gap-2 justify-between">
                    <div className="w-full">
                        {translation.get("page-1-title", "Sample page 1")}
                    </div>
                </div>
            </PageTitle>
            <PageContent>
                <div className="flex flex-col gap-4 p-4">
                    {helloQuery.isLoading || translation.isLoading ? (
                        <LoadingState />
                    ) : (
                        <div>
                            <div className="text-sm text-muted-foreground">
                                {translation.get("hello-message", "API message")}
                            </div>
                            <div className="text-base">
                                {helloQuery.data?.message}
                            </div>
                        </div>
                    )}

                    <div>
                        <div className="mb-2 text-sm font-medium">
                            {translation.get("items-title", "Sample items")}
                        </div>
                        {itemsQuery.isLoading ? (
                            <LoadingState />
                        ) : !itemsQuery.data?.length ? (
                            <EmptyState
                                pluginName={metadata.name}
                                title={translation.get("items-empty", "No sample items yet")}
                            />
                        ) : (
                            <ul className="list-disc pl-5">
                                {itemsQuery.data.map((item) => (
                                    <li key={item.id}>{item.name}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </PageContent>
        </Page>
    );
}
