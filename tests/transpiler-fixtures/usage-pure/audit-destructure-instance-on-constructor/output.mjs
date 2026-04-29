import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
const name = _nameMaybeFunction(Array);
// `const { includes } = Array` destructures from a constructor; `includes` is a prototype method
// not a static, so it must not be rewritten as `Array.includes`. Inherited `name`/`toString` remain valid.
const {
  includes,
  toString
} = Array;
includes();
name;
toString();