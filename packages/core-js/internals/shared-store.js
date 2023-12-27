'use strict';
var IS_PURE = require('../internals/is-pure');
var global = require('../internals/global');
var defineGlobalProperty = require('../internals/define-global-property');

var SHARED = '__core-js_shared__';
var store = module.exports = global[SHARED] || defineGlobalProperty(SHARED, {});

(store.versions || (store.versions = [])).push({
  version: '4.0.0-alpha.0',
  mode: IS_PURE ? 'pure' : 'global',
  copyright: '© 2014-2024 Denis Pushkarev (zloirock.ru)',
  license: 'MIT',
  source: 'https://github.com/zloirock/core-js',
});
