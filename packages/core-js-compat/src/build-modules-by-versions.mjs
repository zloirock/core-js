import modulesByVersions from './modules-by-versions.js';
const modules = require('../modules');

const defaults = new Set(modules);

for (const version of Object.values(modulesByVersions)) {
  for (const module of version) defaults.delete(module);
}

fs.writeJson(new URL('../modules-by-versions.json', import.meta.url), {
  '3.0': [...defaults],
  ...modulesByVersions,
}, { spaces: '  ' });

// eslint-disable-next-line no-console -- output
console.log(chalk.green('modules-by-versions data rebuilt'));
