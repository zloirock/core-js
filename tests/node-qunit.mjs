import { options, run } from 'node-qunit';
import { promisify } from 'util';

Object.assign(options.log, {
  assertions: false,
  tests: false,
  globalSummary: false,
});

options.maxBlockDuration = 6e4;

const { failed } = await promisify(run)([
  {
    code: './packages/core-js-bundle/index.js',
    tests: './tests/bundles/tests.js',
  },
  {
    code: './tests/bundles/pure.js',
  },
]);

if (failed) throw console.log(chalk.red(`${ chalk.cyan(failed) } assertions from unit tests failed on NodeJS`));
else console.log(chalk.green('NodeJS unit tests passed'));
