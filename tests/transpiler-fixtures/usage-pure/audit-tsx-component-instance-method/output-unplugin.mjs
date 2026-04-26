import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
// type-aware JSX: TSX file with TS annotations + JSX literals together. polyfill
// detection must distinguish JSXIdentifier `<Foo>` (skip rename) from runtime usage
// `items.flat()` in the body. `Foo` here is a JSX tag, not a polyfill candidate
type Item = { id: number };
function List({ items }: { items: Item[] }) {
var _ref;
  const flat = _flatMaybeArray(_ref = _mapMaybeArray(items).call(items, i => i.id)).call(_ref);
  return <ul>{_mapMaybeArray(flat).call(flat, id => <li key={id}>{id}</li>)}</ul>;
}
List({ items: [{ id: 1 }] });