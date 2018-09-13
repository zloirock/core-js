// `globalThis` object
// https://github.com/tc39/proposal-global
require('../internals/export')({ global: true }, { globalThis: require('../internals/global') });
