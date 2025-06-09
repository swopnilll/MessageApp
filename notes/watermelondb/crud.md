# WatermelonDB CRUD Operations - Complete Guide

WatermelonDB is a reactive database framework for React Native and web applications. This guide covers all CRUD (Create, Read, Update, Delete) operations with detailed syntax explanations.

## Table of Contents
- [Database Setup](#database-setup)
- [Read Operations (Query)](#read-operations-query)
- [Create Operations](#create-operations)
- [Update Operations](#update-operations)
- [Delete Operations](#delete-operations)
- [Transaction Management](#transaction-management)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

## Database Setup

Before performing CRUD operations, ensure your database is properly initialized:

```javascript
import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import schema from './model/schema'
import migrations from './model/migrations'

const adapter = new SQLiteAdapter({
  schema,
  migrations,
  jsi: true, // Platform.OS === 'ios'
  onSetUpError: error => {
    // Database setup error
  }
})

const database = new Database({
  adapter,
  modelClasses: [
    // Your model classes here
  ],
})
```

## Read Operations (Query)

### Basic Query Syntax

```javascript
const loadUsers = async () => {
  try {
    // Get all records from 'users' table
    const allUsers = await database.get("users").query().fetch();
    
    // Transform raw database objects to your desired format
    const userList = allUsers.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
    }));
    
    return userList;
  } catch (error) {
    console.error("Error loading users:", error);
    throw error;
  }
};
```

### Query Method Breakdown

1. **`database.get("tableName")`** - Gets a collection reference
2. **`.query()`** - Starts a query builder
3. **`.fetch()`** - Executes the query and returns results

### Advanced Query Options

```javascript
// Query with conditions
const activeUsers = await database.get("users")
  .query(
    Q.where('is_active', true),
    Q.where('age', Q.gt(18)),
    Q.sortBy('created_at', Q.desc),
    Q.take(10) // Limit to 10 results
  )
  .fetch();

// Query with relationships
const usersWithPosts = await database.get("users")
  .query(
    Q.experimentalJoinTables(['posts']),
    Q.on('posts', 'user_id', Q.eq(Q.column('users.id')))
  )
  .fetch();
```

### Single Record Queries

```javascript
// Find by ID
const user = await database.get("users").find(userId);

// Find one with condition
const user = await database.get("users")
  .query(Q.where('email', email))
  .fetch()
  .then(results => results[0]);
```

## Create Operations

### Basic Create Syntax

```javascript
const createUser = async (name, email) => {
  try {
    // All write operations must be wrapped in database.write()
    const newUser = await database.write(async () => {
      return await database.get("users").create((user) => {
        // Set properties on the user object
        user.name = name.trim();
        user.email = email.trim() || null;
        // WatermelonDB automatically generates ID and timestamps
      });
    });
    
    console.log("User created with ID:", newUser.id);
    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};
```

### Create Method Breakdown

1. **`database.write(async () => {...})`** - Wraps all write operations in a transaction
2. **`database.get("tableName")`** - Gets the collection
3. **`.create((record) => {...})`** - Creates a new record
4. **Record modification** - Set properties inside the create callback

### Create with Relationships

```javascript
const createUserWithPosts = async (userData, postsData) => {
  const newUser = await database.write(async () => {
    // Create user first
    const user = await database.get("users").create((user) => {
      user.name = userData.name;
      user.email = userData.email;
    });
    
    // Create related posts
    const posts = await Promise.all(
      postsData.map(postData => 
        database.get("posts").create((post) => {
          post.title = postData.title;
          post.content = postData.content;
          post.userId = user.id; // Link to user
        })
      )
    );
    
    return { user, posts };
  });
  
  return newUser;
};
```

## Update Operations

### Basic Update Syntax

```javascript
const updateUser = async (userId, updates) => {
  try {
    await database.write(async () => {
      // First, find the record to update
      const user = await database.get("users").find(userId);
      
      // Then update it
      await user.update((user) => {
        // Modify properties inside the update callback
        if (updates.name) user.name = updates.name;
        if (updates.email) user.email = updates.email;
        // updated_at timestamp is automatically handled
      });
    });
    
    console.log("User updated successfully");
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};
```

### Update Method Breakdown

1. **`database.write(async () => {...})`** - Wrap in transaction
2. **`database.get("tableName").find(id)`** - Find the specific record
3. **`record.update((record) => {...})`** - Update the record
4. **Property modification** - Change properties inside the update callback

### Conditional Updates

```javascript
const conditionalUpdate = async (userId) => {
  await database.write(async () => {
    const user = await database.get("users").find(userId);
    
    await user.update((user) => {
      // Only update if condition is met
      if (user.loginCount < 5) {
        user.loginCount += 1;
      }
      
      // Update based on current values
      user.lastLoginDate = new Date();
      user.isActive = user.loginCount > 0;
    });
  });
};
```

### Batch Updates

```javascript
const batchUpdateUsers = async (userIds, updates) => {
  await database.write(async () => {
    const users = await database.get("users")
      .query(Q.where('id', Q.oneOf(userIds)))
      .fetch();
    
    await Promise.all(
      users.map(user => 
        user.update((user) => {
          Object.assign(user, updates);
        })
      )
    );
  });
};
```

## Delete Operations

### Basic Delete Syntax

```javascript
const deleteUser = async (userId) => {
  try {
    await database.write(async () => {
      // Find the record to delete
      const user = await database.get("users").find(userId);
      
      // Permanently delete the record
      await user.destroyPermanently();
    });
    
    console.log("User deleted successfully");
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};
```

### Delete Method Breakdown

1. **`database.write(async () => {...})`** - Wrap in transaction
2. **`database.get("tableName").find(id)`** - Find the record
3. **`record.destroyPermanently()`** - Permanently delete the record

### Soft Delete vs Hard Delete

```javascript
// Hard delete (permanent removal)
await user.destroyPermanently();

// Soft delete (if your model supports it)
await user.update((user) => {
  user.isDeleted = true;
  user.deletedAt = new Date();
});

// Mark as destroyed (WatermelonDB's built-in soft delete)
await user.markAsDeleted();
```

### Cascade Delete with Relationships

```javascript
const deleteUserWithPosts = async (userId) => {
  await database.write(async () => {
    // Find user and related posts
    const user = await database.get("users").find(userId);
    const userPosts = await database.get("posts")
      .query(Q.where('user_id', userId))
      .fetch();
    
    // Delete all related posts first
    await Promise.all(
      userPosts.map(post => post.destroyPermanently())
    );
    
    // Then delete the user
    await user.destroyPermanently();
  });
};
```

### Batch Delete

```javascript
const batchDeleteUsers = async (userIds) => {
  await database.write(async () => {
    const users = await database.get("users")
      .query(Q.where('id', Q.oneOf(userIds)))
      .fetch();
    
    await Promise.all(
      users.map(user => user.destroyPermanently())
    );
  });
};
```

## Transaction Management

### Why Use `database.write()`?

All write operations (create, update, delete) must be wrapped in `database.write()` for several reasons:

1. **Atomicity** - All operations succeed or fail together
2. **Performance** - Batches operations for better performance
3. **Consistency** - Ensures database remains in a valid state
4. **Thread Safety** - Prevents race conditions

### Transaction Examples

```javascript
// Simple transaction
await database.write(async () => {
  const user = await database.get("users").create((user) => {
    user.name = "John Doe";
  });
});

// Complex transaction with multiple operations
await database.write(async () => {
  // Create user
  const user = await database.get("users").create((user) => {
    user.name = "John Doe";
    user.email = "john@example.com";
  });
  
  // Update another user
  const existingUser = await database.get("users").find("existing_id");
  await existingUser.update((user) => {
    user.friendCount += 1;
  });
  
  // Create related post
  await database.get("posts").create((post) => {
    post.title = "Welcome Post";
    post.userId = user.id;
  });
});
```

### Transaction Error Handling

```javascript
try {
  await database.write(async () => {
    // If any operation fails, the entire transaction is rolled back
    const user = await database.get("users").create((user) => {
      user.name = "John";
    });
    
    // This might fail and rollback the entire transaction
    const duplicate = await database.get("users").create((user) => {
      user.email = "existing@email.com"; // Might violate unique constraint
    });
  });
} catch (error) {
  // Handle transaction failure
  console.error("Transaction failed:", error);
}
```

## Error Handling

### Common Error Patterns

```javascript
const safeCreateUser = async (userData) => {
  try {
    // Validate input
    if (!userData.name || !userData.name.trim()) {
      throw new Error("Name is required");
    }
    
    const user = await database.write(async () => {
      return await database.get("users").create((user) => {
        user.name = userData.name.trim();
        user.email = userData.email?.trim() || null;
      });
    });
    
    return { success: true, user };
  } catch (error) {
    console.error("Failed to create user:", error);
    
    // Handle specific error types
    if (error.message.includes("UNIQUE constraint")) {
      return { success: false, error: "User already exists" };
    }
    
    return { success: false, error: error.message };
  }
};
```

### Record Not Found Handling

```javascript
const safeUpdateUser = async (userId, updates) => {
  try {
    await database.write(async () => {
      const user = await database.get("users").find(userId);
      await user.update((user) => {
        Object.assign(user, updates);
      });
    });
    return { success: true };
  } catch (error) {
    if (error.message.includes("not found")) {
      return { success: false, error: "User not found" };
    }
    throw error; // Re-throw unexpected errors
  }
};
```

## Best Practices

### 1. Always Use Transactions for Writes

```javascript
// ✅ Correct
await database.write(async () => {
  await database.get("users").create(/* ... */);
});

// ❌ Incorrect - Will throw an error
await database.get("users").create(/* ... */);
```

### 2. Validate Input Data

```javascript
const createUser = async (userData) => {
  // Validate before database operations
  if (!userData.name?.trim()) {
    throw new Error("Name is required");
  }
  
  if (userData.email && !isValidEmail(userData.email)) {
    throw new Error("Invalid email format");
  }
  
  return await database.write(async () => {
    return await database.get("users").create((user) => {
      user.name = userData.name.trim();
      user.email = userData.email?.trim() || null;
    });
  });
};
```

### 3. Handle Relationships Properly

```javascript
// When deleting, consider cascade effects
const deleteUserSafely = async (userId) => {
  await database.write(async () => {
    // Delete related records first
    const userPosts = await database.get("posts")
      .query(Q.where('user_id', userId))
      .fetch();
    
    await Promise.all(userPosts.map(post => post.destroyPermanently()));
    
    // Then delete the user
    const user = await database.get("users").find(userId);
    await user.destroyPermanently();
  });
};
```

### 4. Use Proper Error Messages

```javascript
const userOperations = {
  async create(userData) {
    try {
      return await database.write(async () => {
        return await database.get("users").create((user) => {
          user.name = userData.name;
          user.email = userData.email;
        });
      });
    } catch (error) {
      console.error("❌ Error creating user:", error);
      throw new Error(`Failed to create user: ${error.message}`);
    }
  },
  
  async update(userId, updates) {
    try {
      await database.write(async () => {
        const user = await database.get("users").find(userId);
        await user.update((user) => Object.assign(user, updates));
      });
      console.log("✅ User updated successfully");
    } catch (error) {
      console.error("❌ Error updating user:", error);
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }
};
```

### 5. Optimize Queries

```javascript
// ✅ Efficient - Query with specific conditions
const getActiveUsers = async () => {
  return await database.get("users")
    .query(
      Q.where('is_active', true),
      Q.sortBy('created_at', Q.desc)
    )
    .fetch();
};

// ❌ Inefficient - Loading all then filtering
const getActiveUsersInefficient = async () => {
  const allUsers = await database.get("users").query().fetch();
  return allUsers.filter(user => user.isActive);
};
```

This guide covers the essential CRUD operations in WatermelonDB. Remember that WatermelonDB is reactive, so your UI components can observe these database changes and update automatically when data changes.