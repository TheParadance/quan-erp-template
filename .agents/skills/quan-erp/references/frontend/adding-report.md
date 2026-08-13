# Adding Reports to Quan ERP Plugin

In Quan ERP, plugins can contribute to the global reports section using the `AppRegistry.report` API. This allows for a unified reporting experience across different modules.

## Registration

To add reports, use the `AppRegistry.report.add` method within your plugin's `register` function.

### Basic Structure

```tsx
AppRegistry.report.add({
  page: <MyModuleReports />,
  pluginName: metadata.name,
});
```

## Creating a Report Hub (Manual Implementation)

Since reports often contain multiple sub-pages, it is best practice to create a "Hub" or landing page that lists available reports using a card-based grid layout.

### Recommended Layout Pattern

Use the following pattern in your `report/index.tsx` to provide a premium user experience:

```tsx
export function MyModuleReports() {
    const translation = useLocaleTranslation(ModuleLocale);
    const navigate = useNavigate();

    const ReportHub = () => (
        <Page pluginName={metadata.name}>
            <PageTitle>
                <span>{translation.get("moduleReports", "Module Reports")}</span>
            </PageTitle>
            <PageContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                    {reportList.map((item) => (
                        <Card 
                            key={item.id} 
                            className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
                            onClick={() => navigate(item.path)}
                        >
                            <CardHeader className="flex flex-row items-center gap-4">
                                <div className="p-3 bg-muted rounded-xl group-hover:bg-primary/10">
                                    {item.icon}
                                </div>
                                <CardTitle>{item.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>{item.description}</CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </PageContent>
        </Page>
    );

    return (
        <Routes>
            <Route index path="/" element={<ReportHub />} />
            {reportList.map((item) => (
                <Route key={item.path} path={item.path} element={item.element} />
            ))}
        </Routes>
    );
}
```

## Key Components

### 1. `AppRegistry.report.add`
- **`page`**: A React element that handles the routing for the reports.
- **`pluginName`**: The unique name of your plugin (from `module.metadata.json`).

### 2. `DataTable`
Most reports will use a table format. Note that **`DataTable` is NOT provided by `@quan-erp/shared-ui`**. You should use the local `DataTable` component typically found in your plugin's `components/` directory.

Example import:
```tsx
import { DataTable } from "../../components/DataTable";
```

If your plugin doesn't have one, you should implement it locally using `@quan-erp/shared-ui`'s base `Table` components or copy it from another plugin like `hr`.

### 3. Routing
Always use `<Routes>` and `<Route>` from `react-router-dom` to ensure deep-linking works correctly. 

> [!IMPORTANT]
> **Sub-paths should NOT start with a leading slash `/`**. They must be relative to the parent report route (e.g., use `employees` instead of `/employees`).

## Best Practices

- **Localization**: All text elements (titles, descriptions, button labels) MUST be localized.
- **Visual Feedback**: Use hover states and smooth transitions on cards to provide a premium feel.
- **Lazy Loading**: Use `React.lazy()` to import individual report pages to keep the initial load fast.
- **Responsive Design**: Ensure your hub grid adjusts for mobile and desktop views.
