// walkTypeAnnotationGlobals: `Map<string, number>` as return type / param type / VariableDeclarator annotation.
// Map identifier in type position is a valid polyfill trigger - walker emits `global: Map`
// which resolver converts to _Map import
function foo(x: Promise<Map<string, number>>): Set<Date> {
  return null as any;
}
const arr: Array<WeakMap<object, string>> = [];
