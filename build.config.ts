import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['src/index'],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
  },
  externals: [
    'nanoid',
    'p-memoize',
    'p-queue',
    'parse-domain',
    'pino',
    'pino-http',
    'zod',
  ],
})
