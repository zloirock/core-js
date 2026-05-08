// `interface I<T = string[]>` referenced as bare `I` must apply the default to its members.
// Without default propagation, `obj.x` would stay as raw `T` and the array narrow would be lost.
interface I<T = string[]> {
  x: T;
}
declare const obj: I;
obj.x.at(0);
