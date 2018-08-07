import {ServerConfiguration} from '@karma.run/editor'

export default {
  port: parseInt(process.env.PORT),
  karmaDataURL: process.env.KARMA_DATA_URL,
  plugins: [],
  editorContexts: (roles: string[]) =>
    roles.includes('admins')
      ? [
          {
            name: 'Example',
            modelGroups: [
              {
                name: 'Example',
                models: ['_tag']
              }
            ]
          }
        ]
      : [],
  viewContexts: (roles: string[]) =>
    roles.includes('admins')
      ? [
          {
            model: '_tag',
            name: 'Tag',
            slug: 'tag',
            description: 'Description for tag model.',
            displayKeyPaths: [['tag']],
            color: '#FF0000',
            field: {
              fields: [
                ['tag', {description: 'Description for tag field.'}],
                ['model', {description: 'Description for model field.'}]
              ]
            }
          }
        ]
      : []
} as ServerConfiguration
