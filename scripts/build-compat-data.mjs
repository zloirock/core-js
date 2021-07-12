import { data, modules } from '../packages/core-js-compat/src/data.mjs';
import external from '../packages/core-js-compat/src/external.mjs';
import mappings from '../packages/core-js-compat/src/mapping.mjs';
import helpers from 'core-js-compat/helpers.js';

for (const scope of [data, external]) {
  for (const [key, module] of Object.entries(scope)) {
    const { chrome, ie } = module;

    function map(mappingKey) {
      const [engine, targetKey] = mappingKey.split('To')
        .map(it => it.replace(/([a-z])([A-Z])/, (_, a, b) => `${ a }_${ b }`).toLowerCase());
      const version = module[engine];
      if (!version || module[targetKey]) return;
      const mapping = mappings[mappingKey];
      if (typeof mapping == 'function') {
        return module[targetKey] = String(mapping(version));
      }
      const source = helpers.semver(version);
      for (const [from, to] of mapping) {
        if (helpers.compare(source, '<=', from)) {
          return module[targetKey] = String(to);
        }
      }
    }

    map('ChromeToAndroid');
    if (!module.android && chrome) {
      module.android = String(Math.max(chrome, 37));
    }
    map('ChromeToDeno');
    if (/^(?:es|esnext|web)\./.test(key)) {
      map('ChromeToElectron');
    }
    if (!module.edge) {
      if (ie && key !== 'web.immediate') {
        module.edge = '12';
      } else if (chrome) {
        module.edge = String(Math.max(chrome, 74));
      }
    }
    if (key.startsWith('es')) {
      map('ChromeToNode');
    }
    map('ChromeToOpera');
    if (!module.opera_mobile && module.opera <= 42) {
      module.opera_mobile = module.opera;
    } else {
      map('ChromeToOperaMobile');
    }
    map('ChromeToSamsung');
    map('SafariToIOS');
    map('SafariToPhantom');

    scope[key] = helpers.sortObjectByKey(module);
  }
}

function write(filename, content) {
  return fs.writeJson(`./packages/core-js-compat/data/${ filename }.json`, content, { spaces: '  ' });
}

await Promise.all([
  write('data', data),
  write('modules', modules),
  write('external', external),
]);

// eslint-disable-next-line no-console -- output
console.log(chalk.green('compat data rebuilt'));
