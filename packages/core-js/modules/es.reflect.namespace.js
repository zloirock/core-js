'use strict';
var $ = require('../internals/export');

// `Reflect` namespace object
// https://tc39.es/ecma262/#sec-reflect-object
$({ global: true, namespace: true }, { Reflect: {} });
