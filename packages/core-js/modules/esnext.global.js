// https://github.com/tc39/proposal-global
require('../internals/export')({ global: true }, { global: require('core-js-internals/global') });
