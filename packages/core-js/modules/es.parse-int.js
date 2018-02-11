var parseIntImplementation = require('../internals/parse-int');

// `parseInt` method
// https://tc39.github.io/ecma262/#sec-parseint-string-radix
require('../internals/export')({ global: true, forced: parseInt != parseIntImplementation }, {
  parseInt: parseIntImplementation
});
