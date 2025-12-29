import { modules as AllModules } from '@core-js/compat/src/data.mjs';

const { readFile } = fs;
const { red } = chalk;

const MODULES_PATH = 'packages/core-js/modules/';
const Modules = AllModules.filter(it => it.match(/^(?:esnext|web)\./));
for (const moduleName of Modules) {
  const modulePath = path.join(MODULES_PATH, `${ moduleName }.js`);
  const content = await readFile(modulePath, 'utf8');
  if (!/\/\/ (?:types:|no\stypes)/.test(content)) {
    echo(red('No types for module:'), path.resolve(modulePath));
  }
}
