'use strict';
const { writeFileSync } = require('fs');
const { resolve } = require('path');
const { coerce, lte } = require('semver');
const data = require('./data');
const {
  ChromeToNode,
  ChromeToSamsung,
  ChromeToAndroid,
  ChromeToElectron,
  SafariToIOS,
  SafariToPhantomJS,
} = require('./mapping');
const has = Function.call.bind({}.hasOwnProperty);

function map(version, mapping) {
  const coercedVersion = coerce(String(version));
  for (const [from, to] of mapping) {
    if (lte(coercedVersion, coerce(String(from)))) return to;
  }
}

for (const key in data) {
  const module = data[key];
  if (!has(module, 'edge') && has(module, 'ie') && key !== 'web.immediate') {
    module.edge = '12';
  }
  if (has(module, 'chrome')) {
    const { chrome } = module;
    if (!has(module, 'edge')) {
      module.edge = String(Math.max(chrome, 74));
    }
    if (!has(module, 'opera')) {
      module.opera = String(chrome <= 23 ? 15 : chrome <= 29 ? 16 : chrome - 13);
    }
    if (!has(module, 'node') && key.startsWith('es')) {
      const node = map(chrome, ChromeToNode);
      if (node) module.node = node;
    }
    if (!has(module, 'samsung')) {
      const samsung = map(chrome, ChromeToSamsung);
      if (samsung) module.samsung = samsung;
    }
    if (!has(module, 'android')) {
      const android = map(chrome, ChromeToAndroid);
      if (android) module.android = android;
    }
    if (!has(module, 'electron')) {
      const electron = map(chrome, ChromeToElectron);
      if (electron) module.electron = electron;
    }
  }
  if (has(module, 'safari')) {
    if (!has(module, 'ios')) {
      const ios = map(module.safari, SafariToIOS);
      if (ios) module.ios = ios;
    }
    if (!has(module, 'phantom')) {
      const phantom = map(module.safari, SafariToPhantomJS);
      if (phantom) module.phantom = phantom;
    }
  }
}

writeFileSync(resolve(__dirname, '../data.json'), JSON.stringify(data, null, '  '));
