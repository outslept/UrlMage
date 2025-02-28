import { defineConfig } from 'taze'

export default defineConfig({
  // exclude specific packages
  exclude: [],
  // fetch latest package info from registry without cache
  force: false,
  // write to package.json
  write: true,
  // run `npm install` or `yarn install` right after bumping
  install: false,
  // ignore paths for looking for package.json in monorepo
  ignorePaths: ['**/node_modules/**', '**/dist/**'],
  // ignore other workspaces
  ignoreOtherWorkspaces: true,
  // override with different bumping mode for specific packages
  packageMode: {
    // keep TypeScript on the same major version
    typescript: 'minor',
    // always use latest for development tools
    eslint: 'latest',
    vitest: 'latest',
    unbuild: 'latest',
  },
})
