// `<Map.Bar.Baz />` - 3-level JSXMemberExpression chain at the opening-element name slot.
// the root identifier `Map` is the runtime reference; the chain walks up via .object slots.
// without N-deep walk through JSXMemberExpression, depth-2+ namespace tags miss the polyfill
const elem = <Map.Bar.Baz value={x}>{children}</Map.Bar.Baz>;
export { elem };
