// nested destructure rooted in a user-owned local (`baz`) is NOT a proxy-global chain,
// so no polyfill is injected. the receiver type is unknown - prototype-method dispatch
// would be a guess; safe miss preferred over over-injection
const {
  foo: {
    at,
    bar
  }
} = baz;
at(1);
bar();