'use strict';
const { promisify } = require('util');
const fs = require('fs');
// TODO: replace by `fs.promises` after dropping NodeJS < 10 support
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);
const writeFile = promisify(fs.writeFile);
const { dirname, join } = require('path');
const tmpdir = require('os').tmpdir();
// TODO: replace by `mkdir` with `recursive: true` after dropping NodeJS < 10.12 support
const mkdirp = promisify(require('mkdirp'));
const webpack = promisify(require('webpack'));
const compat = require('core-js-compat/compat');
const modulesList = require('core-js-compat/modules');
const { banner } = require('./config');

module.exports = async function ({
    blacklist, // TODO: Remove from `core-js@4`
    exclude = [],
    modules = modulesList.slice(),
    targets,
    filename,
} = {}) {
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
  filter('delete', blacklist || exclude);

  modules = modulesList.filter(it => set.has(it));

  if (targets) modules = compat({ targets, filter: modules }).list;

  let script = banner;

  if (modules.length) {
    const tempFileName = `core-js-${ Math.random().toString(36).slice(2) }.js`;
    const tempFile = join(tmpdir, tempFileName);

    await webpack({
      mode: 'none',
      node: {
        global: false,
        process: false,
        setImmediate: false,
      },
      entry: modules.map(it => require.resolve(`core-js/modules/${ it }`)),
      output: {
        path: tmpdir,
        filename: tempFileName,
      },
    });

    const file = await readFile(tempFile);

    await unlink(tempFile);

    script += `\n!function (undefined) { 'use strict'; ${ file } }();`;
  }

  if (typeof filename != 'undefined') {
    await mkdirp(dirname(filename));
    await writeFile(filename, script);
  }

  return script;
};
