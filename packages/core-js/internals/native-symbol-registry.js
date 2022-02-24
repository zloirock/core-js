var NATIVE_SYMBOL = require('../internals/native-symbol');

/* eslint-disable es/no-symbol -- safe */
module.exports = NATIVE_SYMBOL && !!Symbol['for'] && !!Symbol.keyFor;
