var parseFloatImplementation = require('../internals/parse-float');

// `parseFloat` method
// https://tc39.github.io/ecma262/#sec-parsefloat-string
require('../internals/export')({ global: true, forced: parseFloat != parseFloatImplementation }, {
  parseFloat: parseFloatImplementation
});
