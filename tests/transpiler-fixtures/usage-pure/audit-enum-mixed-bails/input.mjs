// enum with mixed initializer kinds (string + number) — resolveEnumType bails,
// returns null. downstream receiver type = unknown => generic polyfill chosen.
enum Mixed { A = 'a', B = 1 }
declare const x: Mixed;
const arr: string[] = ['a', 'b'];
arr.at(x as any);
