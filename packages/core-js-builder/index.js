'use strict';
const config = require('./config');
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const temp = require('temp');
const compat = require('core-js-compat');
const list = config.list;

module.exports = ({ blacklist = [], modules = [], targets }) => {
  return new Promise((resolve, reject) => {
    const filter = modules.reduce((memo, it) => {
      memo[it] = true;
      return memo;
    }, {});

    for (const ns in filter) {
      if (filter[ns]) {
        for (let i = 0, length = list.length; i < length; ++i) {
          const name = list[i];
          if (name.indexOf(`${ ns }.`) === 0) {
            filter[name] = true;
          }
        }
      }
    }

    for (let i = 0, length1 = blacklist.length; i < length1; ++i) {
      const ns = blacklist[i];
      for (let j = 0, length2 = list.length; j < length2; ++j) {
        const name = list[j];
        if (name === ns || name.indexOf(`${ ns }.`) === 0) {
          filter[name] = false;
        }
      }
    }

    modules = list.filter(it => filter[it]);
    if (targets) modules = compat({ targets, modules }).list;

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
        path: path.dirname(tempFile),
        filename: path.basename(`./${ tempFile }`),
      },
    }, err1 => {
      if (err1) return reject(err1);
      fs.readFile(tempFile, (err2, script) => {
        if (err2) return reject(err2);
        fs.unlink(tempFile, err3 => {
          if (err3) return reject(err3);
          resolve(`${ config.banner }\n!function (undefined) { 'use strict'; ${ script } }();`);
        });
      });
    });
  });
};
