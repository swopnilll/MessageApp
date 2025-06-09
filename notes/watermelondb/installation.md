# WatermelonDB Expo Setup - Comprehensive Guide

## Why WatermelonDB is Complex to Set Up

WatermelonDB is a high-performance reactive database for React Native that uses **native SQLite** under the hood. This means it requires native code compilation, which is why it's so complex to set up compared to pure JavaScript libraries.

## Development Build Requirement

### Why You Need `expo-dev-client`

With Expo SDK 51, WatermelonDB requires a **development build** (custom build) rather than Expo Go because:

1. **Native Dependencies**: WatermelonDB uses native SQLite libraries that aren't available in Expo Go
2. **Custom Native Code**: The database operations happen in native code (C++/Java/Swift) for performance
3. **Build-time Configuration**: The Expo plugin needs to configure native build settings

Your `expo-dev-client` dependency enables you to create custom development builds that include these native libraries.

## Babel Configuration Deep Dive

### The Decorator Plugin (`@babel/plugin-proposal-decorators`)

```javascript
"@babel/plugin-proposal-decorators": "^7.27.1"
```

**Why This is Required:**
- WatermelonDB uses **ES6 decorators** extensively in its API
- Decorators like `@field`, `@relation`, `@action` are core to WatermelonDB's syntax
- React Native's default Babel setup doesn't support decorators out of the box

**Example WatermelonDB Code Using Decorators:**
```javascript
class Post extends Model {
  @field('title') title
  @field('body') body
  @date('created_at') createdAt
}
```

### Babel Configuration File

Your `babel.config.js` configuration:

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-transform-class-properties', { loose: true }],
      ['@babel/plugin-transform-private-methods', { loose: true }],
      ['@babel/plugin-transform-private-property-in-object', { loose: true }]
    ],
  };
};
```

**What Each Plugin Does:**

1. **`@babel/plugin-proposal-decorators`**: Transforms decorator syntax (`@field`) into regular JavaScript
2. **`@babel/plugin-transform-class-properties`**: Allows class properties without constructors
3. **`@babel/plugin-transform-private-methods`**: Supports private class methods (`#method`)
4. **`@babel/plugin-transform-private-property-in-object`**: Supports private properties (`#property`)

The `{ legacy: true }` and `{ loose: true }` options ensure compatibility with WatermelonDB's expectations.

## Expo Plugin Configuration

### `@morrowdigital/watermelondb-expo-plugin`

```javascript
"@morrowdigital/watermelondb-expo-plugin": "^2.3.3"
```

This plugin handles the complex native setup automatically:

**What it does:**
- Configures SQLite dependencies for iOS and Android
- Sets up native build flags
- Handles the database file configuration
- Manages native library linking

**Your Configuration:**
```javascript
[
  "@morrowdigital/watermelondb-expo-plugin",
  {
    "databases": ["morrow.db"]
  }
]
```

This tells the plugin to create a database file named `morrow.db`.

## Build Properties Configuration

### `expo-build-properties`

```javascript
[
  "expo-build-properties",
  {
    "ios": {
      "useFrameworks": "static"
    },
    "android": {
      "kotlinVersion": "1.6.10"
    }
  }
]
```

**Why These Settings:**

1. **`useFrameworks: "static"`**: Forces iOS to use static frameworks instead of dynamic ones
   - WatermelonDB's native dependencies work better with static linking
   - Prevents runtime linking issues

2. **`kotlinVersion: "1.6.10"`**: Ensures Android uses a compatible Kotlin version
   - WatermelonDB's Android native code requires specific Kotlin compatibility

## Why No Podfile Changes in Expo

In traditional React Native, you'd need to modify the `Podfile` manually:

```ruby
pod 'simdjson', path: '../node_modules/@nozbe/simdjson'
```

**With Expo + Plugin:**
- The `@morrowdigital/watermelondb-expo-plugin` handles all native configuration
- No manual Podfile or Android Gradle modifications needed
- The plugin automatically adds required native dependencies during build

## Package Dependencies Explained

### Core Dependencies You Added:

1. **`@nozbe/watermelondb`**: The main database library
2. **`@morrowdigital/watermelondb-expo-plugin`**: Expo-specific configuration plugin
3. **`expo-dev-client`**: Enables custom development builds
4. **`expo-build-properties`**: Configures native build settings
5. **`@babel/plugin-proposal-decorators`**: Babel transformation for decorators

### What WatermelonDB Expects:

- **Native SQLite**: Direct access to device's SQLite database
- **High Performance**: C++ bridge for database operations
- **Reactive Queries**: Observable database queries that update UI automatically
- **Offline-First**: Works without network connectivity
- **Type Safety**: Full TypeScript support

## The Build Process

When you run `expo run:ios` or `expo run:android`:

1. **Babel Transform**: Converts decorators and modern JS to compatible code
2. **Native Plugin**: Adds SQLite libraries and WatermelonDB native code
3. **Static Linking**: Links libraries statically (iOS) for better compatibility
4. **Database Creation**: Creates the `morrow.db` file structure

This setup complexity is why WatermelonDB has a reputation for being difficult to configure, but once working, it provides excellent performance for local database operations.

