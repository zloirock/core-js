'use strict';
const { readFile, unlink } = require('fs');
const { basename, dirname } = require('path');
const webpack = require('webpack');
const temp = require('temp');
const compat = require('core-js-compat');
const modulesList = Object.keys(require('core-js-compat/data'));
const { banner } = require('./config');

module.exports = ({ blacklist = [], modules = modulesList.slice(), targets } = {}) => {
  return new Promise((resolve, reject) => {
    const filter = modules.reduce((memo, it) => {
      memo[it] = true;
      return memo;
    }, {});

    for (const ns in filter) {
      if (filter[ns]) {
        for (const name of modulesList) {
          if (name.startsWith(`${ ns }.`)) {
            filter[name] = true;
          }
        }
      }
    }

    for (const ns of blacklist) {
      for (const name of modulesList) {
        if (name === ns || name.startsWith(`${ ns }.`)) {
          filter[name] = false;
        }
      }
    }

    modules = modulesList.filter(it => filter[it]);

    if (targets) modules = compat({ targets, filter: modules }).list;

    const tempFile = temp.path({ suffix: '.js' });

    webpack({
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
    }, err1 => {
      if (err1) return reject(err1);
      readFile(tempFile, (err2, script) => {
        if (err2) return reject(err2);
        unlink(tempFile, err3 => {
          if (err3) return reject(err3);
          resolve(`${ banner }\n!function (undefined) { 'use strict'; ${ script } }();`);
        });
      });
    });
  });
};
