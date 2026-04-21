// `Uppercase<T>` / `Lowercase<T>` always evaluate to string per hardcoded branch
// in resolveNamedType. expect string-specific polyfill.
declare const u: Uppercase<'hello'>;
u.at(-1);
u.includes('foo');
