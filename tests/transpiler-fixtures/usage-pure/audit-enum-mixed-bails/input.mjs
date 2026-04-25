// enum with mixed initialiser kinds (string + number) - plugin can't pin down a single
// primitive type for `x`, so the receiver type is unknown and `.at(...)` falls back to
// the generic instance polyfill
enum Mixed { A = 'a', B = 1 }
declare const x: Mixed;
const arr: string[] = ['a', 'b'];
arr.at(x as any);
