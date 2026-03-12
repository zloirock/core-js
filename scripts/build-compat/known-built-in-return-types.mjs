import {
  instanceMethods,
  instanceProperties,
  staticMethods,
  staticProperties,
} from '../../packages/core-js-compat/src/known-built-in-return-types.mjs';

await fs.writeJson('packages/core-js-compat/known-built-in-return-types.json', {
  staticMethods,
  staticProperties,
  instanceMethods,
  instanceProperties,
}, { spaces: '  ' });

echo(chalk.green('known-built-in-return-types rebuilt'));
