import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// Only the matched branch supplies an array.
type Row = {
  tag: {
    kind: 'a';
  };
  items: number[];
} | {
  tag: {
    kind: 'b';
  };
  items: string;
};
export function read(value: Row) {
  var _ref;
  if (value?.tag?.kind === 'a') return _atMaybeArray(_ref = value.items).call(_ref, 0);
}