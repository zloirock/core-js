var NATIVE_SYMBOL = require('../internals/symbol-constructor-detection');

/* eslint-disable es-x/no-symbol -- safe */
module.exports = NATIVE_SYMBOL && !!Symbol['for'] && !!Symbol.keyFor;
