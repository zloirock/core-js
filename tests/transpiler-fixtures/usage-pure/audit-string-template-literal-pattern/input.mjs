// `Uppercase<T>` always evaluates to a string subtype: instance calls on `u` pick the
// string-specific polyfill variant (parity with plain `string` typings).
declare const u: Uppercase<'hello'>;
u.at(-1);
u.includes('foo');
