// `<Map.Bar.Baz />` - 3-level JSX member tag chain at the opening-tag name slot.
// the root identifier `Map` is the runtime reference; the chain walks up via .object slots.
// without an N-deep walk through the JSX member tag, depth-2+ namespace tags miss the polyfill
const elem = <Map.Bar.Baz value={x}>{children}</Map.Bar.Baz>;
export { elem };
