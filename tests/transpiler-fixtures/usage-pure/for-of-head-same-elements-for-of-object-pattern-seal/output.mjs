import _Object$seal from "@core-js/pure/actual/object/seal";
for (const _ref2 of [{
  w: Object
}, {
  v: Object
}]) {
  const {
      w: _ref
    } = _ref2,
    viaOtherKey = _ref === Object ? _Object$seal : _ref.seal;
  viaOtherKey;
}