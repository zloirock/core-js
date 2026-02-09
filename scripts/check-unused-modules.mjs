import konan from 'konan';
import { modules, ignored } from '../packages/core-js-compat/src/data.mjs';

async function jsModulesFrom(path) {
  const directory = await fs.readdir(path);
  return new Set(directory.filter(it => it.endsWith('.js')).map(it => it.slice(0, -3)));
}

function log(set, kind) {
  if (set.size) {
    echo(chalk.red(`found some unused ${ kind }:`));
    set.forEach(it => echo(chalk.cyan(it)));
  } else echo(chalk.green(`unused ${ kind } not found`));
}

const globalModules = await jsModulesFrom('packages/core-js/modules');
const definedModules = new Set([
  ...modules,
  ...ignored,
]);

globalModules.forEach(it => definedModules.has(it) && globalModules.delete(it));

log(globalModules, 'modules');

const internalModules = await jsModulesFrom('packages/core-js/internals');
const allModules = await glob('packages/core-js?(-pure)/**/*.js');

await Promise.all(allModules.map(async path => {
  for (const dependency of konan(String(await fs.readFile(path, 'utf8'))).strings) {
    internalModules.delete(dependency.match(/\/internals\/(?<module>[^/]+)$/)?.groups.module);
  }
}));

log(internalModules, 'internal modules');

const pureModules = new Set(await glob('packages/core-js-pure/override/**/*.js'));

await Promise.all([...pureModules].map(async path => {
  if (await fs.pathExists(path.replace('-pure/override', ''))) pureModules.delete(path);
}));

log(pureModules, 'pure modules');
