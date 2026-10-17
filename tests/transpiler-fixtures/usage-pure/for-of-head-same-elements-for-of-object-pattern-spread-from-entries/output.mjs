import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
for (const _ref2 of [{
  w: Object
}, {
  w: Object,
  ...more
}]) {
  const {
      w: _ref
    } = _ref2,
    viaSpread = _ref === Object ? _Object$fromEntries : _ref.fromEntries;
  viaSpread;
}