'use strict';
const config = require('./config');
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const temp = require('temp');
const list = config.list;
const libraryBlacklist = config.libraryBlacklist;
const banner = config.banner;
const readFile = fs.readFile;
const unlink = fs.unlink;
const basename = path.basename;
const dirname = path.dirname;
const join = path.join;
module.exports = options => {
  const library = options.library || false;
  const umd = options.umd != null ? options.umd : true;
  let modules = options.modules || [];
  let blacklist = options.blacklist || [];
  return new Promise((resolve, reject) => {
    modules = modules.reduce((memo, it) => {
      memo[it] = true;
      return memo;
    }, {});
    for (const ns in modules) {
      if (modules[ns]) {
        for (let i = 0, length = list.length; i < length; ++i) {
          let name = list[i];
          if (name.indexOf(ns + '.') === 0) {
            modules[name] = true;
          }
        }
      }
    }
    if (library) {
      blacklist = blacklist.concat(libraryBlacklist);
    }
    for (let i = 0, length1 = blacklist.length; i < length1; ++i) {
      const ns = blacklist[i];
      for (let j = 0, length2 = list.length; j < length2; ++j) {
        let name = list[j];
        if (name === ns || name.indexOf(ns + '.') === 0) {
          modules[name] = false;
        }
      }
    }
    const TARGET = temp.path({
      suffix: '.js',
    });
    webpack({
      entry: list
        .filter(it => modules[it])
        .map(it => library
          ? join(__dirname, '..', 'library', 'modules', it)
          : join(__dirname, '..', 'modules', it)
        ),
      output: {
        path: dirname(TARGET),
        filename: basename('./' + TARGET),
      },
    }, err1 => {
      if (err1) return reject(err1);
      readFile(TARGET, (err2, script) => {
        if (err2) return reject(err2);
        unlink(TARGET, err3 => {
          if (err3) return reject(err3);
          const exportScript = umd ? `
            // CommonJS export
            if (typeof module != 'undefined' && module.exports) module.exports = __e;
            // RequireJS export
            else if (typeof define == 'function' && define.amd) define(function () { return __e; });
            // Export to global object
            else __g.core = __e;`.replace(/^\s+/gm, '') : '';
          resolve(`${ banner }\n!function (__e, __g, undefined) {\n'use strict';\n${ script }\n${ exportScript }\n}(1, 1);`);
        });
      });
    });
  });
};
