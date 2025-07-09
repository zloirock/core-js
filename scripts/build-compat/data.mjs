/* https://github.com/import-js/eslint-plugin-import/issues/2181 */
import { dataWithIgnored as data, ignored, modules } from '@core-js/compat/src/data.mjs';
import external from '@core-js/compat/src/external.mjs';
import mappings from '@core-js/compat/src/mapping.mjs';
import helpers from '@core-js/compat/helpers.js';

const { compare, semver, sortObjectByKey } = helpers;
const { hasOwn } = Object;

for (const scope of [data, external]) {
  for (const [key, module] of Object.entries(scope)) {
    const { chrome, ie } = module;

    function map(mappingKey) {
      const [engine, targetKey] = mappingKey.split('To')
        .map(it => it.replace(/(?<lower>[a-z])(?<upper>[A-Z])/, '$<lower>-$<upper>').toLowerCase());
      const version = module[engine];
      if (!version || hasOwn(module, targetKey)) return;
      const mapping = mappings[mappingKey];
      if (typeof mapping == 'function') {
        return module[targetKey] = String(mapping(version));
      }
      const source = semver(version);
      for (const [from, to] of mapping) {
        if (compare(source, '<=', from)) {
          return module[targetKey] = String(to);
        }
      }
    }

    if (/^(?:es|esnext)\./.test(key)) {
      map('ChromeToDeno');
      map('ChromeToNode');
    }
    if (!hasOwn(module, 'edge')) {
      if (ie && !key.includes('immediate')) {
        module.edge = '12';
      } else if (chrome) {
        module.edge = String(Math.max(chrome, 79));
      }
    }
    if (/^(?:es|esnext|web)\./.test(key)) {
      map('ChromeToElectron');
    }
    map('ChromeToOpera');
    map('ChromeToChromeAndroid');
    map('ChromeToAndroid');
    if (!hasOwn(module, 'android') && module['chrome-android']) {
      // https://github.com/mdn/browser-compat-data/blob/main/docs/matching-browser-releases/index.md#version-numbers-for-features-in-android-webview
      module.android = String(Math.max(module['chrome-android'], 37));
    }
    if (!hasOwn(module, 'opera-android') && module.opera <= 42) {
      module['opera-android'] = module.opera;
    } else {
      map('ChromeAndroidToOperaAndroid');
    }
    map('ChromeAndroidToQuest');
    map('ChromeAndroidToSamsung');
    if (/^(?:es|esnext)\./.test(key)) {
      map('SafariToBun');
    }
    map('FirefoxToFirefoxAndroid');
    map('SafariToIOS');
    if (!hasOwn(module, 'ios') && hasOwn(module, 'safari')) {
      module.ios = module.safari;
    }
    map('HermesToReactNative');

    for (const [engine, version] of Object.entries(module)) {
      if (!version) delete module[engine];
    }

    scope[key] = sortObjectByKey(module);
  }
}

function write(filename, content) {
  return fs.writeJson(`packages/core-js-compat/${ filename }.json`, content, { spaces: '  ' });
}

const dataWithoutIgnored = { ...data };

for (const ignore of ignored) delete dataWithoutIgnored[ignore];

await Promise.all([
  write('data', dataWithoutIgnored),
  write('modules', modules),
  write('external', external),
  // version for compat data tests
  fs.writeFile('tests/compat/compat-data.js', `;(typeof global != 'undefined' ? global : Function('return this')()).data = ${
    JSON.stringify(data, null, '  ')
  }`),
]);

echo(chalk.green('compat data rebuilt'));
