import konan from 'konan';
import { modules } from 'core-js-compat/src/data.mjs';

async function jsModulesFrom(path) {
  return new Set((await fs.readdir(path)).filter(it => it.endsWith('.js')).map(it => it.slice(0, -3)));
}

function log(set, kind) {
  if (set.size) {
    console.log(chalk.red(`found some unused ${ kind }:`));
    set.forEach(it => console.log(chalk.cyan(it)));
  } else console.log(chalk.green(`unused ${ kind } not found`));
}

const globalModules = await jsModulesFrom('packages/core-js/modules');
const definedModules = new Set([
  ...modules,
  // TODO: drop those special cases from core-js@4
  'es.aggregate-error.constructor',
  'es.data-view.constructor',
  'es.map.constructor',
  'es.object.get-own-property-symbols',
  'es.promise.constructor',
  'es.promise.all',
  'es.promise.catch',
  'es.promise.race',
  'es.promise.reject',
  'es.promise.resolve',
  'es.set.constructor',
  'es.string.trim-left',
  'es.string.trim-right',
  'es.symbol.constructor',
  'es.symbol.for',
  'es.symbol.key-for',
  'es.weak-map.constructor',
  'es.weak-set.constructor',
  'esnext.string.at-alternative',
  'esnext.observable.constructor',
  'esnext.observable.from',
  'esnext.observable.of',
  'web.clear-immediate',
  'web.set-immediate',
  'web.set-interval',
  'web.set-timeout',
  'web.url-search-params.constructor',
  'web.url.constructor',
]);

globalModules.forEach(it => definedModules.has(it) && globalModules.delete(it));

log(globalModules, 'modules');

const internalModules = await jsModulesFrom('packages/core-js/internals');
const allModules = await globby('packages/core-js?(-pure)/**/*.js');

await Promise.all(allModules.map(async path => {
  for (const dependency of konan(String(await fs.readFile(path))).strings) {
    internalModules.delete(dependency.match(/\/internals\/([^/]+)$/)?.[1]);
  }
}));

log(internalModules, 'internal modules');

const pureModules = new Set(await globby('packages/core-js-pure/override/**/*.js'));

await Promise.all([...pureModules].map(async path => {
  if (await fs.pathExists(path.replace('-pure/override', ''))) pureModules.delete(path);
}));

log(pureModules, 'pure modules');
