var parseIntImplementation = require('./_parse-int');

// `parseInt` method
// https://tc39.github.io/ecma262/#sec-parseint-string-radix
require('./_export')({ global: true, forced: parseInt != parseIntImplementation }, {
  parseInt: parseIntImplementation
});
