'use strict';
const { deepStrictEqual } = require('assert');
const data = require('../packages/core-js-compat/data');
const entries = require('../packages/core-js-compat/entries');

const modules = Object.keys(data);
const es = modules.filter(it => /^es\./.test(it));
const stable = modules.filter(it => !/^esnext\./.test(it));

function sameModules(a, b) {
  deepStrictEqual(new Set(a), new Set(b));
}

sameModules(entries['core-js'], modules);
sameModules(entries['core-js/es'], es);
sameModules(entries['core-js/stable'], stable);
sameModules(entries['core-js/features'], modules);
