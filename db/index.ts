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
  modelClasses: [
   Users
  ],
})

export default database;
