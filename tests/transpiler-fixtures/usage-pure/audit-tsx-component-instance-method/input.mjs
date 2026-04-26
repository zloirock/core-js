// type-aware JSX: TSX file with TS annotations + JSX literals together. polyfill
// detection must distinguish JSXIdentifier `<Foo>` (skip rename) from runtime usage
// `items.flat()` in the body. `Foo` here is a JSX tag, not a polyfill candidate
type Item = { id: number };
function List({ items }: { items: Item[] }) {
  const flat = items.map(i => i.id).flat();
  return <ul>{flat.map(id => <li key={id}>{id}</li>)}</ul>;
}
List({ items: [{ id: 1 }] });
