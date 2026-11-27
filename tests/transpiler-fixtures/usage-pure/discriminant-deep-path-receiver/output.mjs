import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Only the matched branch supplies an array.
type Row = {
  outer: {
    tag: {
      kind: 'a';
    };
  };
  items: number[];
} | {
  outer: {
    tag: {
      kind: 'b';
    };
  };
  items: string;
};
export function read(value: Row) {
  var _ref;
  if (value.outer.tag.kind === 'a') return _atMaybeArray(_ref = value.items).call(_ref, 0);
}