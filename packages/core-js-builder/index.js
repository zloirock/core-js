'use strict';
const promisify = require('util.promisify');
const fs = require('fs');
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);
const writeFile = promisify(fs.writeFile);
const { basename, dirname, join } = require('path');
const tmpdir = require('os').tmpdir();
const { sync: mkdirp } = require('mkdirp');
const webpack = promisify(require('webpack'));
const compat = require('core-js-compat');
const modulesList = Object.keys(require('core-js-compat/data'));
const { banner } = require('./config');

module.exports = function ({ blacklist = [], modules = modulesList.slice(), targets, filename } = {}) {
  const set = new Set();

  function filter(method, list) {
    for (const ns of list) {
      for (const name of modulesList) {
        if (name === ns || name.startsWith(`${ ns }.`)) {
          set[method](name);
        }
      }
    }
  }

  filter('add', modules);
  filter('delete', blacklist);

  modules = modulesList.filter(it => set.has(it));

  if (targets) modules = compat({ targets, filter: modules }).list;

  const tempFile = join(tmpdir, `core-js-${ Math.random().toString(36).slice(2) }.js`);

  return webpack({
    mode: 'none',
    node: {
      global: false,
      process: false,
      setImmediate: false,
    },
    entry: modules.map(it => require.resolve(`core-js/modules/${ it }`)),
    output: {
      path: dirname(tempFile),
      filename: basename(`./${ tempFile }`),
    },
  }).then(() => readFile(tempFile)).then(script => unlink(tempFile).then(() => {
    script = `${ banner }\n!function (undefined) { 'use strict'; ${ script } }();`;
    if (typeof filename != 'undefined') {
      mkdirp(dirname(filename));
      return writeFile(filename, script).then(() => script);
    } return script;
  }));
};
