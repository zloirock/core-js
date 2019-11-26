'use strict';
const { ok } = require('assert');
const data = require('../packages/core-js-compat/data');
const entries = require('../packages/core-js-compat/entries');

const modules = Object.keys(data);
const es = modules.filter(it => /^es\./.test(it));
const stable = modules.filter(it => !/^esnext\./.test(it));

ok(entries['core-js'].length === modules.length);
ok(new Set([...modules, ...entries['core-js']]).size === modules.length);
ok(entries['core-js/es'].length === es.length);
ok(new Set([...es, ...entries['core-js/es']]).size === es.length);
ok(entries['core-js/stable'].length === stable.length);
ok(new Set([...stable, ...entries['core-js/stable']]).size === stable.length);
ok(entries['core-js/features'].length === modules.length);
ok(new Set([...modules, ...entries['core-js/features']]).size === modules.length);
