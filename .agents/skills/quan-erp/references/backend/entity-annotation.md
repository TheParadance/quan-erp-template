# Entity Annotations Reference

This document summarizes the annotations (decorators) used when defining database entities in Quan ERP plugins. Most of these, including the AI integration annotations, are imported from `@quan-erp/shared-backend-core`.

## AI Integration & Security

Quan ERP is natively AI-integrated and automatically scans system entities to provide intelligent features. To ensure security and privacy, use the following annotations to control which data is exposed to the AI engine.

### `@AIEntityInfo(metadata: AIEntityOptions)`
Provides high-level metadata about the entity class to the AI system to improve its understanding of the data context.

**Options:**
- `description`: A clear, human-readable description of what this entity represents.

### `@AIExcludeEntity()`
Completely excludes the entire entity from being scanned or indexed by the AI system. Use this for high-security entities that must remain completely invisible to automated AI processes.

### `@AIExcludeColumn()`
Marks a specific column/property to be excluded from AI processing. Use this for sensitive fields (like passwords, secret keys, or private identifiers) while still allowing the AI to understand the rest of the entity.

**Usage:**
```typescript
@AIExcludeColumn() // AI system exclusion
@Column({ type: 'varchar', select: false })
password: string
```

---

## Usage Best Practices
- **Isolation**: Always use the plugin name as a prefix for `@Entity` names to ensure namespace isolation.
- **BaseEntity**: Always extend `BaseEntity` from `@quan-erp/shared-backend-core`.
- **Relationship Typing**: Use `InstanceType<typeof RelatedEntity>` for relationship property types to avoid circular dependency issues.
