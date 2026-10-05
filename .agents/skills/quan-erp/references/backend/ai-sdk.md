# AI Assistant SDK (`shared-backend-core`)

Source root: `shared-backend-core/src/core-features/ai-assistant/sdk/`.

Use this when implementing chat LLM calls, token usage, new providers, or speech-to-speech realtime agents. For exposing plugin methods as tools, see [Adding AI Tools](./add-ai-tools.md).

## Chat LLM contract (`AI`)

```typescript
interface AI<S, M> {
  query(prompt: string, callbacks?: AIQueryCallbacks, options?: AIOptions<M>): Promise<string>;
  stream(prompt: string, callbacks: StreamCallbacks<S>, options?: AIOptions<M>): void;
}
```

| Piece | Role |
| :--- | :--- |
| `query` | Non-streaming; returns final assistant text |
| `stream` | Streaming via `onChunk`; tool loop until no more tool calls |
| `AIOptions` | `tools`, `messages`, `model`, `tempurature`, `parallel_tool_calls`, `max_completion_tokens`, `reasoning_effort`, `isCancelled` |
| `onToolCall` | Execute a tool; result is fed back into the next completion |

**Obtain an instance** via `AIModelService.getInstance(modelName)` — do not `new OpenAI(...)` in plugins unless you own the credentials outside `ai_model`.

```typescript
const instance = await this.aiModelService.getInstance(assistant.model.name);
instance.stream(prompt, {
  onChunk: (text) => { /* … */ },
  onToolCall: async ({ name, arguments: args }) => this.toolService.callToolByFunctionName(name, args),
  onUsage: ({ inputTokens, outputTokens, totalTokens }) => { /* … */ },
  onDone: () => { /* … */ },
  onError: (err) => { /* … */ },
}, { tools, messages, reasoning_effort: "low" });
```

Chat assistants treat every `sdkType` **except** `GeminiSDK` as OpenAI-compatible message shapes (`ChatCompletionMessageParam`). Gemini uses its own `contents` / `Content` path.

## Token usage

```typescript
type AITokenUsage = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
};
```

- **`query`**: optional `callbacks.onUsage(usage)` after the full tool loop.
- **`stream`**: optional `callbacks.onUsage(usage)` once before `onDone`.
- OpenAI / Qwen / OpenRouter: sum `prompt_tokens` + `completion_tokens` across tool rounds (`stream_options.include_usage` on stream).
- Gemini: latest `usageMetadata` snapshot (`promptTokenCount` / `candidatesTokenCount`).
- Helpers: `emptyTokenUsage()`, `addTokenUsage(a, b)` in `sdk.interface.ts`.

## SDK types (`AISDKAPIType`)

Stored on `ai_model.sdkType`. Used by `AIModelService.initializeAIClient`.

| Constant | Value | Client | Base URL |
| :--- | :--- | :--- | :--- |
| `AISDKAPIType.OpenAI` | `OpenAISDK` | `OpenAI` | **Required** (any OpenAI-compatible host) |
| `AISDKAPIType.Gemini` | `GeminiSDK` | `Gemini` | N/A (Google GenAI) |
| `AISDKAPIType.Qwen` | `QwenSDK` | `Qwen` | Optional; default `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| _(other / unknown)_ | — | `OpenRouter` extends `OpenAI` | **Required** |

Frontend selectors live in `base/frontend` (`AISDKAPIType` in `api/ai-assistant/ai-assistant.dto.ts` and `api/ai-model/ai-model.type.ts`). Keep backend and frontend enums in sync when adding a provider.

### Model id helpers (`Models`)

Common ids under `Models[AIModelProvider.*]` in `sdk.interface.ts`, e.g.:

- OpenAI: `gpt-4o`, `gpt-realtime`, …
- DeepSeek: `deepseek-chat`, …
- Gemini: `gemini-2.5-flash`, live audio preview id
- Qwen: `qwen-plus`, `qwen-turbo`, `qwen-max`, `qwen-flash`, `qwen-omni-turbo-realtime`

Prefer these constants over hard-coded strings when seeding or configuring models.

## Provider notes

### OpenAI-compatible (`openai/openai.lib.ts`)

Constructor: `{ apiKey, baseURL, model }`. Works with OpenAI, DeepSeek, and any compatible gateway. Implements tool loops for both `query` and `stream`, plus `onUsage`.

### OpenRouter (`openrouter/openrouter.lib.ts`)

Empty subclass of `OpenAI` — same API; used as default fallback for unrecognized `sdkType`.

### Qwen / DashScope (`qwen/qwen.lib.ts`)

Extends `OpenAI`. Default base URL China compatible-mode; intl mirror: `QWEN_INTL_BASE_URL`. Use a DashScope API key and chat model ids (`qwen-plus`, …). Realtime omni uses a separate agent (below).

### Gemini (`gemini/gemini.lib.ts`)

Native `@google/genai` `generateContent` / `generateContentStream`. Tool support in chat path is thinner than OpenAI — prefer OpenAI-compatible providers when heavy tool use is required.

## Realtime (speech-to-speech)

```typescript
interface RealtimeAIAgent {
  readonly provider: "openai" | "gemini" | "qwen";
  connect(config, callbacks): Promise<void>;
  sendAudio(pcm16: Buffer): void;
  sendToolResult(toolCallId, result): void;
  interrupt(): void;
  close(): void;
}
```

Factory: `createRealtimeAIAgent({ sdkType, model, apiKey, baseUrl })` or `AIModelService.getRealtimeAgent(modelName)`.

| Detection | Agent |
| :--- | :--- |
| `GeminiSDK` | `GeminiLiveAIAgent` |
| `QwenSDK` / model or URL contains `qwen` / `dashscope` | `QwenRealtimeAIAgent` (DashScope WS) |
| `OpenAISDK` + realtime-capable model | `OpenAIRealtimeAIAgent` |
| OpenAI + chat-only model (`*-chat`, deepseek, …) | Throws — configure a realtime / omni / live model |

Realtime tools use `RealtimeAIAgentTool` (`name`, `description`, `parameters`), not the chat `ChatCompletionTool` shape.

## Adding a new LLM provider

1. Add folder `sdk/<provider>/` with `<provider>.lib.ts` implementing `AI` (or extending `OpenAI` if OpenAI-compatible).
2. Add `AISDKAPIType.<Name>` in `sdk.interface.ts` **and** both frontend `AISDKAPIType` copies.
3. Wire `AIModelService.initializeAIClient` switch; relax `baseUrl` only when a safe default exists (like Qwen).
4. Extend `CreateAIModelDto` union + AI Model admin UI select.
5. Export from `core-features/index.ts`.
6. If voice is supported, add realtime agent + `createRealtimeAIAgent` branch.
7. Update this reference.

## Related

- [Adding AI Tools](./add-ai-tools.md) — `@AITool` on services / MCP annotations
- [Annotations](./annotations.md) — `@AITool` summary
- Chat entry: `AIChatAssistantService` (`ai-chat-assistant/`)
- Model CRUD: `AIModelService` (`ai-model/`)
