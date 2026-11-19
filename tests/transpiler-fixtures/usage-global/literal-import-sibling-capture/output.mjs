import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// A live imported slot cannot be read again after a sibling default.
// The multi-declarator keeps a single captured receiver and its instance polyfill.
import rows from './rows.js';
const before = note('before'),
  {
    y: {
      0: {
        first
      } = {},
      at
    }
  } = {
    y: rows
  };
use(first, at);