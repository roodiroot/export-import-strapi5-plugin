````markdown
# Strapi 5 Export/Import CSV Plugin

## Features

- Adds export/import buttons to configured Strapi content types
- Exports data to CSV format with selected fields
- Imports data from CSV while preserving relationships
- Supports various field types with automatic conversion

## Installation

```bash
npm install export-import-strapi5-plugin
```
````

## Configuration

Add to `./config/plugins.js`:

```javascript
module.exports = ({ env }) => ({
  'export-import-strapi5-plugin': {
    enabled: true,
    config: {
      entities: {
        'api::product.product': {
          fields: [
            'category.name',
            'brand.name',
            'name',
            'slug',
            'price',
            'sale',
            'hit',
            'available',
            'popularity',
          ],
        },
        // Add other content types as needed
      },
    },
  },
});
```

### Configuration Options

- `entities`: Object containing content type configurations
  - Key: Content Type UID (e.g. `"api::product.product"`)
  - `fields`: Array of fields to include in export/import
    - Supports nested fields with dot notation
    - Omit `documentID` - it's automatically included

## Supported Field Types

| Type        | Import Handling                   | Example               |
| ----------- | --------------------------------- | --------------------- |
| Integer     | Convert to integer                | `"42"` → `42`         |
| BigInteger  | Convert to integer                | `"1234567890"` → ...  |
| Float       | Convert to float                  | `"3.14"` → `3.14`     |
| Decimal     | Convert to float                  | `"99.99"` → `99.99`   |
| Boolean     | Convert 'true'/'false' to boolean | `"true"` → `true`     |
| String/Text | Trim whitespace                   | `" text "` → `"text"` |

## Usage Notes

1. **Record Identification**:

   - Imports update existing records using `documentID`
   - This field is automatically included in exports
   - Never remove/modify documentID in CSV files

2. **Relationship Handling**:
   - Relationships are exported (e.g. `category.name`)
   - Relationship data is read-only during import
   - Only direct fields of the entity are updated

## Example CSV Format

For `api::product.product`:

```csv
documentID,category.name,brand.name,name,slug,price,sale,hit,available,popularity
1,Electronics,Sony,TV,sony-tv,999.99,true,true,true,5
2,Electronics,Samsung,Phone,samsung-phone,799.99,false,true,true,8
```

## Limitations

1. Only updates existing records (by documentID)
2. Relationship fields are read-only during import
3. Not all Strapi field types are supported
4. CSV files must maintain original documentIDs

## UI Integration

After installation:

1. Navigate to Content Manager
2. Select configured content type
3. Find new buttons in list view:
   - **Export CSV** - Download current data
   - **Import CSV** - Update records from file

---

> Note: Always back up your data before performing imports

```

```
