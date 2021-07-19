import { data, modules } from 'core-js-compat/src/data.mjs';
import external from 'core-js-compat/src/external.mjs';
import mapping from 'core-js-compat/src/mapping.mjs';
import helpers from 'core-js-compat/helpers.js';

for (const scope of [data, external]) {
  for (const [key, module] of Object.entries(scope)) {
    const { chrome, ie, safari } = module;

    const map = function ($mapping, version, targetKey) {
      if (module[targetKey]) return;
      const source = helpers.semver(version);
      for (const [from, to] of $mapping) {
        if (helpers.compare(source, '<=', from)) {
          module[targetKey] = String(to);
          return;
        }
      }
    };

    if (!module.edge && ie && key !== 'web.immediate') {
      module.edge = '12';
    }

    if (chrome) {
      if (!module.edge) {
        module.edge = String(Math.max(chrome, 74));
      }
      if (!module.opera) {
        module.opera = String(chrome <= 23 ? 15 : chrome <= 29 ? 16 : chrome <= 82 ? chrome - 13 : chrome - 14);
      }
      if (!module.opera_mobile && module.opera && module.opera <= 42) {
        module.opera_mobile = module.opera;
      } else {
        map(mapping.ChromeToOperaMobile, chrome, 'opera_mobile');
      }
      if (key.startsWith('es')) {
        map(mapping.ChromeToNode, chrome, 'node');
      }
      map(mapping.ChromeToSamsung, chrome, 'samsung');
      map(mapping.ChromeToAndroid, chrome, 'android');
      if (!module.android) {
        module.android = String(Math.max(chrome, 37));
      }
      map(mapping.ChromeToDeno, chrome, 'deno');
      if (/^(?:es|esnext|web)\./.test(key)) {
        map(mapping.ChromeToElectron, chrome, 'electron');
      }
    }

    if (safari) {
      map(mapping.SafariToIOS, safari, 'ios');
      map(mapping.SafariToPhantomJS, safari, 'phantom');
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
