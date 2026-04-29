// `const { includes } = Array` destructures from a constructor; `includes` is a prototype method
// not a static, so it must not be rewritten as `Array.includes`. Inherited `name`/`toString` remain valid.
const { includes, name, toString } = Array;
includes();
name;
toString();
