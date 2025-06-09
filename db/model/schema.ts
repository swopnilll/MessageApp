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