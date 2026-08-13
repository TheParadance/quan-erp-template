> Parent skill: [Base Plugin](../SKILL.md)

## 12. Media / files

### `useMediaFilesQuery`
| | |
|---|---|
| **Kind** | query hook |
| **Signature** | `(query?: RequestIndexPaginationDto, option?) => UseQueryResult<MediaFileDto[], Error>` |
| **APINames** | `useMediaFilesQuery` |

### `useUploadMediaQuery`
| | |
|---|---|
| **Kind** | mutation hook |
| **Signature** | `() => UseMutationResult<ResponseDto<MediaFileDto>, Error, { file: File; type: FileLocation; access: 'private' \| 'public'; accessRoleIds: string }, unknown>` |
| **APINames** | `useUploadMediaQuery` |
| **Notes** | `accessRoleIds` is a comma-separated role id string. `FileLocation`: `'local' \| 's3'`. |

### `MediaDialog`
| | |
|---|---|
| **Kind** | component |
| **APINames** | `MediaDialog` |
| **Key props** | `onSelect?`, `allowMultiple?`, `selected?`, `children?` (trigger), optional query/upload overrides |
| **Example** | |
```tsx
<MediaDialog allowMultiple onSelect={(files) => setMedia(files)}>
  <Button>Pick media</Button>
</MediaDialog>
```

**Types:** `MediaFileDto`, `FileLocation`, `FileAccess`, `MediaDialogProps`

---
