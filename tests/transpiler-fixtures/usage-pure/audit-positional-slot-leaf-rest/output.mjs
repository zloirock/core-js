import _at from "@core-js/pure/actual/instance/at";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// the POSITIONAL slot renames an ARRAY element to a minted name, and a REST inside that element's
// pattern travels with it: the pattern survives, reading the minted name, with the claim's key
// renamed to a sentinel so it goes on excluding itself from what the rest collects
const rows = _Object$assign([1, [2]], {
  extra: 7
});
const holder = {
  y: rows
};
const viaCatch = function () {
  try {
    throw [rows];
  } catch (_ref) {
    let [_ref2] = _ref;
    let at = _at(_ref2);
    let {
      at: _unused,
      ...rest
    } = _ref2;
    return [at, rest.extra, 'at' in rest];
  }
}();
// ... and the same one hop in, where the rename takes the element and the residual keeps the hop
const viaCatchNested = function () {
  try {
    throw [holder];
  } catch (_ref3) {
    let [_ref4] = _ref3;
    let _ref5 = _ref4.y;
    let at = _at(_ref5);
    let {
      at: _unused2,
      ...rest
    } = _ref5;
    return [at, rest.extra];
  }
}();
// ... and a second NAMED binding rides the same residual the rest does: the pattern survives
// against the minted name, the claim's slot spelled as a sentinel, so every other slot binds what
// it bound
const viaCatchSibling = function () {
  try {
    throw [rows];
  } catch (_ref6) {
    let [_ref7] = _ref6;
    let at = _at(_ref7);
    let {
      at: _unused3,
      extra,
      ...rest
    } = _ref7;
    return [at, extra, _Object$keys(rest).length];
  }
}();
// NEGATIVE: a COMPUTED key is spelled by the claim's own channel, so the residual cannot re-emit it -
// the shape stays native rather than print a key the source never wrote
const viaComputedKey = function () {
  try {
    throw [rows];
  } catch ([{
    [_Symbol$iterator]: it,
    ...rest
  }]) {
    return [typeof it, _Object$keys(rest).length];
  }
}();
export { viaCatch, viaCatchNested, viaCatchSibling, viaComputedKey };