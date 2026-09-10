import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// a METHOD's computed key evaluates at class definition time, in the enclosing scope, so the typeof
// guard above still holds there - on both parsers alike: babel spells the method as one function
// node, ESTree as a wrapper around one, and the key slot is straight-line in both spellings. only
// the string family injects
declare function anyv(): any;
export function f(v: any) {
  let x: any = v;
  if (typeof x === 'string') {
    class K {
      [_atMaybeString(x).call(x, 0) as any]() {}
    }
    x = anyv();
    return K;
  }
  return null;
}