# WatermelonDB Architecture - Complete Breakdown

## Overview: The Four Pillars of WatermelonDB

Your database setup follows WatermelonDB's architecture pattern with four essential components:

1. **Schema** - Database structure definition
2. **Models** - Data representation classes
3. **Migrations** - Database version management
4. **Database Instance** - The orchestrator

Let's dive deep into each component:

---

## 1. Schema Definition (`db/model/schema.ts`)

```typescript
import { appSchema, tableSchema } from '@nozbe/watermelondb'

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'users',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'email', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' }
      ]
    })
  ]
})
```

### What's Happening Here:

**`appSchema`**: The root schema definition
- **`version: 1`**: Schema version number (critical for migrations)
- **`tables`**: Array of table definitions

**`tableSchema`**: Individual table structure
- **`name: 'users'`**: Table name in SQLite database
- **`columns`**: Column definitions

### Column Types Deep Dive:

1. **`name: 'name', type: 'string'`**
   - Creates a TEXT column in SQLite
   - Required field (no `isOptional`)

2. **`name: 'email', type: 'string', isOptional: true`**
   - TEXT column that can be NULL
   - `isOptional: true` allows null values

3. **`created_at/updated_at: type: 'number'`**
   - INTEGER columns in SQLite
   - Store Unix timestamps (milliseconds since epoch)

### Behind the Scenes:
When your app starts, this schema generates the actual SQLite table:

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,  -- Auto-added by WatermelonDB
  name TEXT NOT NULL,
  email TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  _status TEXT NOT NULL DEFAULT 'created',  -- Auto-added
  _changed TEXT NOT NULL DEFAULT ''        -- Auto-added
);
```

**Auto-Generated Columns:**
- **`id`**: Primary key (string UUID)
- **`_status`**: Track record state ('created', 'updated', 'deleted')
- **`_changed`**: Comma-separated list of changed fields

---

## 2. Migration System (`db/model/migration.ts`)

```typescript
import { schemaMigrations } from '@nozbe/watermelondb/Schema/migrations'

export default schemaMigrations({
  migrations: [
    // We'll add migration definitions here later
  ],
})
```

### What This Does:

**`schemaMigrations`**: Migration management system
- **`migrations: []`**: Empty array means no migrations yet
- This will contain version upgrade instructions

### Migration Example (Future):
When you update your schema to version 2, you'd add:

```typescript
export default schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        addColumns({
          table: 'users',
          columns: [
            { name: 'phone', type: 'string', isOptional: true }
          ]
        })
      ]
    }
  ],
})
```

### Why Migrations Matter:
- **Data Preservation**: Existing user data isn't lost
- **Version Control**: Database structure changes are tracked
- **Rollback Safety**: Can handle schema updates gracefully

---

## 3. Model Definition (`db/model/Users.ts`)

```typescript
import { Model } from '@nozbe/watermelondb'

export default class Users extends Model {
  static table = 'users'
}
```

### Current State Analysis:

**Basic Model Structure:**
- **`extends Model`**: Inherits WatermelonDB's base functionality
- **`static table = 'users'`**: Links to the 'users' table in schema

### What's Missing (Typical WatermelonDB Model):

Your model is extremely minimal. A complete model would look like:

```typescript
import { Model } from '@nozbe/watermelondb'
import { field, date, readonly } from '@nozbe/watermelondb/decorators'

export default class Users extends Model {
  static table = 'users'
  
  @field('name') name!: string
  @field('email') email?: string
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date
}
```

### Decorator Breakdown:

1. **`@field('name')`**: Maps to 'name' column, creates getter/setter
2. **`@field('email')`**: Optional field (notice `?` in TypeScript)
3. **`@readonly`**: Prevents direct modification
4. **`@date('created_at')`**: Converts number timestamp to Date object

### Why Your Basic Model Still Works:
- WatermelonDB provides base functionality even without decorators
- You can access fields via `record.get('name')` or `record.set('name', value)`
- Decorators add TypeScript typing and convenience methods

---

## 4. Database Instance (`db/index.ts`)

```typescript
import { Platform } from 'react-native'
import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'

import schema from './model/schema'
import migrations from './model/migration'
import Users from './model/Users'

const adapter = new SQLiteAdapter({
  schema,
  migrations,
  jsi: true,
  onSetUpError: error => {
    console.error('WatermelonDB setup error:', error)
  }
})

const database = new Database({
  adapter,
  modelClasses: [Users],
})
```

### Adapter Configuration Deep Dive:

**`SQLiteAdapter`**: The bridge between WatermelonDB and native SQLite

**Configuration Options:**
1. **`schema`**: Your table structure definition
2. **`migrations`**: Schema version management
3. **`jsi: true`**: JavaScript Interface for better performance
4. **`onSetUpError`**: Error handling callback

### JSI Performance Boost:
**`jsi: true`** enables:
- **Direct C++ Bridge**: Bypasses React Native bridge
- **Synchronous Operations**: No async overhead for simple queries
- **Better Performance**: 2-3x faster database operations

### Database Instance:
**`new Database()`**: The main database controller

**Configuration:**
- **`adapter`**: The SQLite adapter instance
- **`modelClasses: [Users]`**: Array of all model classes

### What Happens at Runtime:

1. **Adapter Initialization**: 
   - Connects to SQLite database file
   - Runs schema validation
   - Applies pending migrations

2. **Model Registration**:
   - Maps model classes to table names
   - Sets up query builders
   - Enables reactive queries

3. **Database Ready**:
   - All tables created/updated
   - Models available for queries
   - Reactive system active

---

## The Complete Data Flow

### 1. App Startup:
```
Schema → SQLite Tables Creation
Models → Query Interface Setup
Adapter → Native Database Connection
Database → Ready for Operations
```

### 2. Data Operations:
```typescript
// Create
const user = await database.write(async () => {
  return await database.get('users').create(user => {
    user.name = 'John Doe'
    user.email = 'john@example.com'
  })
})

// Query
const users = await database.get('users').query().fetch()

// Reactive Query
const usersObservable = database.get('users').query().observe()
```

### 3. Under the Hood:
```
TypeScript → Babel (Decorators) → JavaScript
JavaScript → JSI → C++ Bridge → SQLite
SQLite → Results → Reactive Observers → UI Updates
```

---

## Why This Architecture Works

### Separation of Concerns:
- **Schema**: Structure definition
- **Models**: Data representation
- **Migrations**: Version management
- **Database**: Orchestration

### Performance Benefits:
- **Lazy Loading**: Models created only when needed
- **Reactive Queries**: UI updates automatically
- **Native Performance**: Direct SQLite access

### Developer Experience:
- **Type Safety**: Full TypeScript support
- **Hot Reloading**: Schema changes during development
- **Error Handling**: Clear error messages

Your setup is the foundation - next you'll likely add decorators to your Users model and start creating/querying data!