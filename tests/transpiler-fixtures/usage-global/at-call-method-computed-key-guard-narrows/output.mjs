import "core-js/modules/es.string.at";
// a METHOD's computed key evaluates at class definition time, in the enclosing scope, so the typeof
// guard above still holds there - on both parsers alike: babel spells the method as one function
// node, ESTree as a wrapper around one, and the key slot is straight-line in both spellings. only
// the string family injects
declare function anyv(): any;
export function f(v: any) {
  let x: any = v;
  if (typeof x === 'string') {
    class K {
      [x.at(0) as any]() {}
    }
    x = anyv();
    return K;
  }
  return null;
}