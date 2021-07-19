import { data, modules } from 'core-js-compat/src/data.mjs';
import external from 'core-js-compat/src/external.mjs';
import mappings from 'core-js-compat/src/mapping.mjs';
import helpers from 'core-js-compat/helpers.js';

for (const scope of [data, external]) {
  for (const [key, module] of Object.entries(scope)) {
    const { chrome, ie, safari } = module;

    function map(mappingKey, version, targetKey) {
      if (module[targetKey]) return;
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

    if (!module.edge && ie && key !== 'web.immediate') {
      module.edge = '12';
    }

    if (chrome) {
      map('ChromeToAndroid', chrome, 'android');
      if (!module.android) {
        module.android = String(Math.max(chrome, 37));
      }
      map('ChromeToDeno', chrome, 'deno');
      if (!module.edge) {
        module.edge = String(Math.max(chrome, 74));
      }
      if (/^(?:es|esnext|web)\./.test(key)) {
        map('ChromeToElectron', chrome, 'electron');
      }
      if (key.startsWith('es')) {
        map('ChromeToNode', chrome, 'node');
      }
      map('ChromeToOpera', chrome, 'opera');
      if (!module.opera_mobile && module.opera && module.opera <= 42) {
        module.opera_mobile = module.opera;
      } else {
        map('ChromeToOperaMobile', chrome, 'opera_mobile');
      }
      map('ChromeToSamsung', chrome, 'samsung');
    }

    if (safari) {
      map('SafariToIOS', safari, 'ios');
      map('SafariToPhantomJS', safari, 'phantom');
    }

    scope[key] = helpers.sortObjectByKey(module);
  }
}

function write(filename, content) {
  return fs.writeJson(`./packages/core-js-compat/${ filename }.json`, content, { spaces: '  ' });
}

await Promise.all([
  write('data', data),
  write('modules', modules),
  write('external', external),
]);

// eslint-disable-next-line no-console -- output
console.log(chalk.green('compat data rebuilt'));
