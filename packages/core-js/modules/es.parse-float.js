var parseFloatImplementation = require('./_parse-float');

// `parseFloat` method
// https://tc39.github.io/ecma262/#sec-parsefloat-string
require('./_export')({ global: true, forced: parseFloat != parseFloatImplementation }, {
  parseFloat: parseFloatImplementation
});
