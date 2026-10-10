import antfu from '@antfu/eslint-config'
import prettier from 'eslint-config-prettier'

export default antfu({
  type: 'lib',
  stylistic: false,
  formatters: false,
  gitignore: true,
  ignores: ['**/pnpm-lock.yaml'],
}).append(prettier, {
  files: ['test/fixtures/nestjs/consumer.ts'],
  rules: {
    // Decorator metadata must retain the service class as a runtime value.
    'ts/consistent-type-imports': 'off',
  },
})
