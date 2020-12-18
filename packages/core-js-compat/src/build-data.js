'use strict';
const { writeFileSync } = require('fs');
const { resolve } = require('path');
const { compare, sortObjectByKey, semver } = require('../helpers');
const data = require('./data');
const external = require('./external');
const {
  ChromeToNode,
  ChromeToSamsung,
  ChromeToOperaMobile,
  ChromeToAndroid,
  ChromeToElectron,
  SafariToIOS,
  SafariToPhantomJS,
} = require('./mapping');

for (const scope of [data, external]) {
  for (const [key, module] of Object.entries(scope)) {
    const { chrome, ie, safari } = module;

    const map = function (mapping, version, targetKey) {
      if (module[targetKey]) return;
      const source = semver(version);
      for (const [from, to] of mapping) {
        if (compare(source, '<=', from)) {
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
        map(ChromeToOperaMobile, chrome, 'opera_mobile');
      }
      if (key.startsWith('es')) {
        map(ChromeToNode, chrome, 'node');
      }
      map(ChromeToSamsung, chrome, 'samsung');
      map(ChromeToAndroid, chrome, 'android');
      if (!module.android) {
        module.android = String(Math.max(chrome, 37));
      }
      if (/^(es|esnext|web)\./.test(key)) {
        map(ChromeToElectron, chrome, 'electron');
      }
    }

    if (safari) {
      map(SafariToIOS, safari, 'ios');
      map(SafariToPhantomJS, safari, 'phantom');
    }

    scope[key] = sortObjectByKey(module);
  }
}

function writeJSON(filename, content) {
  writeFileSync(resolve(__dirname, filename), JSON.stringify(content, null, '  '));
}

writeJSON('../data.json', data);
writeJSON('../modules.json', Object.keys(data));
writeJSON('../external.json', external);

// eslint-disable-next-line no-console
console.log('\u001B[32mcompat data rebuilt\u001B[0m');
