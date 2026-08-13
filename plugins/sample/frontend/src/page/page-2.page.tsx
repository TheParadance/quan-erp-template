import {
    Page,
    PageContent,
    PageNavTitle,
    PageTitle,
    useLazyLocaleTranslation,
} from "@quan-erp/shared-ui";
import { metadata } from "../lib/metadata";
import { SampleLocaleLazy } from "./sample.locale";

export function PageTwo() {
    const translation = useLazyLocaleTranslation(SampleLocaleLazy);

    return (
        <Page
            pluginName={metadata.name}
            navMenu={{
                menuTitle: (
                    <PageNavTitle>
                        {translation.get("page-2-title", "Sample page 2")}
                    </PageNavTitle>
                ),
                leadingBackButton: true,
            }}
            className="w-full h-full overflow-y-auto"
        >
            <PageTitle>
                <div className="flex items-center gap-2 justify-between">
                    <div className="w-full">
                        {translation.get("page-2-title", "Sample page 2")}
                    </div>
                </div>
            </PageTitle>
            <PageContent>
                <div className="p-4">
                    {translation.get("page-2-title", "Sample page 2")}
                </div>
            </PageContent>
        </Page>
    );
}
