// built-in globals used in type-annotation positions (return type, param type, variable
// annotation) still count as polyfill triggers. Map / Set / Promise / WeakMap in type
// positions pull in the corresponding polyfill imports so the runtime references resolve
// when the types get stripped to values at compile time
function foo(x: Promise<Map<string, number>>): Set<Date> {
  return null as any;
}
const arr: Array<WeakMap<object, string>> = [];