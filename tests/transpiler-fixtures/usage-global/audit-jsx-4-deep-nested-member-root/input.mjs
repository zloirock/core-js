// 4-level JSX member tag chain at opening-tag name slot: walk must traverse the whole
// `.object` chain to identify the leftmost identifier as the runtime root reference.
// regression check for the N-deep walk (depth-2+ shouldn't have a hardcoded ceiling)
const elem = <Map.Foo.Bar.Baz value={x}>{children}</Map.Foo.Bar.Baz>;
export { elem };
