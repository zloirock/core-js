// usage-global with walkAnnotations=true: Map/Promise/Set in type positions emit polyfill imports
function foo(x: Promise<Map<string, number>>): Set<Date> {
  return null as any;
}
const arr: Array<WeakMap<object, string>> = [];
