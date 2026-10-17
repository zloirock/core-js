import _entriesMaybeArray from "@core-js/pure/actual/array/instance/entries";
export const viaInlineSpreadSecondSlot = ((first, _ref, _unused = void 0) => {
  let entriesSpread = _entriesMaybeArray(_ref);
  return entriesSpread;
})(...[other, [1, 2]]);