'use strict';
const config = require('./config');
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const temp = require('temp');
const list = config.list;

function dedent(template) {
  const result = [];
  for (let i = 0; template.length > i;) {
    result.push(template[i++].replace(/\n\s+/gm, '\n'));
    if (i !== template.length) result.push(arguments[i]);
  }
  return result.join('').trim();
}

module.exports = options => {
  const umd = options.umd != null ? options.umd : true;
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
        .map(it => path.join(__dirname, '..', 'modules', it)),
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
          resolve(dedent`
            ${ config.banner }
            !function (__e, __g, undefined) {
            'use strict';
            ${ script }
            ${ umd ? dedent`
            // CommonJS export
            if (typeof module != 'undefined' && module.exports) module.exports = __e;
            // RequireJS export
            else if (typeof define == 'function' && define.amd) define(function () { return __e; });
            // Export to global object
            else __g.core = __e;
            ` : '' }
            }(1, 1);
          `);
        });
      });
    });
  });
};
