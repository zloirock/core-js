'use strict';
const config = require('./config');
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const temp = require('temp');
const list = config.list;

module.exports = options => {
  const source = options.source || 'core-js';
  const blacklist = options.blacklist || [];
  let modules = options.modules || [];
  return new Promise((resolve, reject) => {
    modules = modules.reduce((memo, it) => {
      memo[it] = true;
      return memo;
    }, {});
    for (const ns in modules) {
      if (modules[ns]) {
        for (let i = 0, length = list.length; i < length; ++i) {
          const name = list[i];
          if (name.indexOf(`${ ns }.`) === 0) {
            modules[name] = true;
          }
        }
      }
    }
    for (let i = 0, length1 = blacklist.length; i < length1; ++i) {
      const ns = blacklist[i];
      for (let j = 0, length2 = list.length; j < length2; ++j) {
        const name = list[j];
        if (name === ns || name.indexOf(`${ ns }.`) === 0) {
          modules[name] = false;
        }
      }
    }
    const TARGET = temp.path({
      suffix: '.js',
    });
    webpack({
      node: {
        global: false,
        process: false,
        setImmediate: false,
      },
      entry: list
        .filter(it => modules[it])
        .map(it => require.resolve(`${ source }/modules/${ it }`)),
      output: {
        path: path.dirname(TARGET),
        filename: path.basename(`./${ TARGET }`),
      },
    }, err1 => {
      if (err1) return reject(err1);
      fs.readFile(TARGET, (err2, script) => {
        if (err2) return reject(err2);
        fs.unlink(TARGET, err3 => {
          if (err3) return reject(err3);
          resolve(`${ config.banner }\n!function (undefined) { 'use strict'; ${ script } }();`);
        });
      });
    });
  });
};
