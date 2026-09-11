// a 4-deep JSX member tag (`<Map.Foo.Bar.Baz>`) must walk all the way to the leftmost
// identifier so `Map` is recognised as the root global.
const elem = <Map.Foo.Bar.Baz value={x}>{children}</Map.Foo.Bar.Baz>;
export { elem };
