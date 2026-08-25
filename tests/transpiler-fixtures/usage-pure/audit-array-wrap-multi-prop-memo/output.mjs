import _at from "@core-js/pure/actual/instance/at";
import _keys from "@core-js/pure/actual/instance/keys";
// an untouched leading statement anchors the comments below: every row here is consumed,
// and a removed first statement would carry its leading comment down to the next one
const anchor = [1, 2];
export { anchor };

// a RE-REFERENCEABLE wrapper element needs no memo: each dispatch spells it, and the residual
// - left binding nothing - drops whole (the consumed keys bind through the extractions, so a
// residual re-reading them would fire their getters a second time, which native never does)
const at2 = _at(arr);
const keys2 = _keys(arr);
export { at2, keys2 };

// SEVERAL claims off an element that CANNOT be re-referenced share one leading ref
const _ref = c ? arr : other;
const at = _at(_ref);
const keys = _keys(_ref);
export { at, keys };

// ... and a surviving USER binding keeps the residual, reading through that same ref
const _ref2 = c ? arr : o2;
const at3 = _at(_ref2);
const keys3 = _keys(_ref2);
const [{
  other: other3
}] = [_ref2];
export { at3, keys3, other3 };

// NEGATIVE: a REST sibling gathers what the pattern does not name, so the consumed key stays
// excluded by its sentinel instead of leaving
const at4 = _at(arr);
const [{
  at: _unused,
  ...rest
}] = [arr];
export { at4, rest };

// NEGATIVE: a BODYLESS control slot has no statement list to plant the memo in - planting it
// would block-wrap the body and re-point the declaration the strategy still reads, so the
// element is spelled raw there
if (cond) {
  var _ref3 = c ? arr : other;
  var at5 = _at(_ref3);
  var keys5 = _keys(_ref3);
}
export { at5, keys5 };