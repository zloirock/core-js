import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// JSX deep-member component head: <Foo.Bar.Baz /> - root identifier `Foo` is a runtime
// reference, but `.Bar`/`.Baz` are property reads on it (not polyfillable globals).
// global root reference like `Promise.resolve(x)` outside JSX still polyfilled.
const a = <Foo.Bar.Baz attr={x} />;
const b = _Promise$resolve(x);