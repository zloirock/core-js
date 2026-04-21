import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
const name = _nameMaybeFunction(Array);
// `const { includes } = Array` - `includes` is Array.prototype instance method, not Array.X static.
// destructureReceiverHint returns 'function' (Array is KNOWN_FUNCTION_GLOBALS). resolveHint uses
// hint to reject instance-only on constructor - includes should NOT be treated as Array.includes static.
// But `name` / `toString` are inherited Function.prototype properties - valid
const {
  includes,
  toString
} = Array;
includes();
name;
toString();