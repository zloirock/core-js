import _at from "@core-js/pure/actual/instance/at";
// A live imported slot cannot be read again after a sibling default.
// The multi-declarator keeps a single captured receiver and its instance polyfill.
import rows from './rows.js';
const before = note('before'),
  {
    y: _ref
  } = {
    y: rows
  },
  {
    0: {
      first
    } = {}
  } = _ref,
  at = _at(_ref);
use(first, at);