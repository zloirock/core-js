import {
  globalMethods,
  globalProperties,
  instanceMethods,
  instanceProperties,
  staticMethods,
  staticProperties,
  staticTypeGuards,
} from '../../packages/core-js-compat/src/known-built-in-return-types.mjs';

await fs.writeJson('packages/core-js-compat/known-built-in-return-types.json', {
  globalMethods,
  globalProperties,
  staticMethods,
  staticProperties,
  instanceMethods,
  instanceProperties,
  staticTypeGuards,
}, { spaces: '  ' });

echo(chalk.green('known-built-in-return-types rebuilt'));
