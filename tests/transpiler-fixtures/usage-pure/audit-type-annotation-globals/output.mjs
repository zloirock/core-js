// built-in globals used ONLY in type-annotation positions (return type, param type,
// variable annotation) are NOT polyfill triggers in usage-pure: annotations are erased
// at compile time, so no runtime reference remains and no pure import is emitted
function foo(x: Promise<Map<string, number>>): Set<Date> {
  return null as any;
}
const arr: Array<WeakMap<object, string>> = [];