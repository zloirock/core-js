import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// A later alias write changes the slot from String to Array only after the first read.
// Distinct methods expose String.at before the write and Array.includes after it.
const rows = ['02'];
const alias = rows;
use(_atMaybeString(_ref = rows[0]).call(_ref, -1));
alias[0] = [0, 2];
const current = _includesMaybeArray(rows[0]);
use(current);