# Adding Sportlight Search

Sportlight search (Cmd/Ctrl + K) allows users to quickly find features or data across the system. Plugins can register their own search callbacks to provide relevant results.

## 1. Search Types

There are three types of spotlight searches available:

| Type | Name | Description |
| :--- | :--- | :--- |
| `SIMPLE_SEARCH` | Link/Navigation Search | Used for providing shortcuts to pages, actions, or frequently used links. Returns static or filtered navigation items. |
| `FULL_TEXT_SEARCH` | Backend Data Search | Used for searching database records (e.g., employees, partners, products) using keyword matching. |
| `DEEP_SEARCH` | AI/Vector Search | Used for complex or semantic queries using vector search capabilities. |

## 2. Registration

Search callbacks are registered using the `registerSportlightSearch` function from `@quan-erp/base-frontend`. This should typically be done in the `register` method of your plugin's `index.tsx`.

### Simple Search (Navigation)
Used for providing shortcuts to pages or frequently used actions.

```tsx
import { 
    registerSportlightSearch, 
    SportlightSearchType, 
    SportlightSearchQuery, 
    SportlightSearchResult,
    navigate,
    useSportlightSearchStore
} from "@quan-erp/base-frontend";
import { CommandItem } from "@quan-erp/shared-ui";
import { User } from "@icon-park/react";

// Recommended pattern: Create a wrapper component to handle navigation and closing the search box
function SearchLinkItem({ path, children, value }: { path: string, children: React.ReactNode, value: string }) {
    const store = useSportlightSearchStore();
    
    return (
        <CommandItem 
            value={value} 
            onSelect={() => {
                navigate(path);
                store.close();
            }}
        >
            {children}
        </CommandItem>
    );
}

registerSportlightSearch({
    pluginName: 'your-plugin-name',
    groupTitle: 'Actions',
    searchType: SportlightSearchType.SIMPLE_SEARCH,
    callback: async (query: SportlightSearchQuery): Promise<SportlightSearchResult[]> => {
        // Return static navigation items or filter based on query.query
        return [
            {
                priority: 1,
                component: (
                    <SearchLinkItem path="/app/profile" value="go to profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>Go to Profile</span>
                    </SearchLinkItem>
                )
            }
        ];
    }
});
```

### Full Text Search (Data)
Used for searching database records (e.g., employees, partners, products).

```tsx
registerSportlightSearch({
    pluginName: 'your-plugin-name',
    groupTitle: 'Employees',
    searchType: SportlightSearchType.FULL_TEXT_SEARCH,
    callback: async (query: SportlightSearchQuery): Promise<SportlightSearchResult[]> => {
        if (query.searchType !== SportlightSearchType.FULL_TEXT_SEARCH) return [];
        
        // Fetch data from your API
        const results = await myPluginApi.search(query.query);
        
        return results.map(item => ({
            priority: 1,
            component: (
                <CommandItem 
                    key={item.id}
                    value={item.name} 
                    onSelect={() => navigate(`/app/feature/${item.id}`)}
                >
                    <div className="flex flex-col">
                        <span className="font-bold">{item.name}</span>
                        <span className="text-xs text-muted-foreground">{item.description}</span>
                    </div>
                </CommandItem>
            )
        }));
    }
});
```

### Deep Search (AI/Vector)
Used for semantic searches or AI-driven queries using vector embeddings.

```tsx
registerSportlightSearch({
    pluginName: 'your-plugin-name',
    groupTitle: 'AI Knowledge',
    searchType: SportlightSearchType.DEEP_SEARCH,
    callback: async (query: SportlightSearchQuery): Promise<SportlightSearchResult[]> => {
        if (query.searchType !== SportlightSearchType.DEEP_SEARCH) return [];
        
        // Fetch vector search results from backend
        const results = await myPluginApi.deepSearch(query.query);
        
        return results.map(item => ({
            priority: item.score, // Use similarity score for priority
            component: (
                <CommandItem 
                    key={item.id}
                    value={item.content} 
                    onSelect={() => navigate(`/app/knowledge/${item.id}`)}
                >
                    <div className="flex flex-col">
                        <span className="font-medium">{item.title}</span>
                        <span className="text-xs text-muted-foreground line-clamp-1">{item.content}</span>
                    </div>
                </CommandItem>
            )
        }));
    }
});
```

## 3. Configuration Options

| Property | Type | Description |
| :--- | :--- | :--- |
| `pluginName` | `string` | The name of the plugin registering the callback. |
| `groupTitle` | `string` | The header displayed above this group of search results. |
| `searchType` | `SportlightSearchType` | `SIMPLE_SEARCH`, `FULL_TEXT_SEARCH`, or `DEEP_SEARCH`. |
| `callback` | `function` | Async function returning `SportlightSearchResult[]`. |

## 3. Search Result Object

| Property | Type | Description |
| :--- | :--- | :--- |
| `priority` | `number` | Determines the sorting order (higher values appear first). |
| `component` | `ReactNode` | The UI for the search result. **Must** be wrapped in `<CommandItem />` from `@quan-erp/shared-ui`. |
