// distributive conditional `T extends any ? T[] : never` must propagate the
// substituted T through the trueType to keep Array dispatch precise
type Wrap<T> = T extends any ? T[] : never;
function fn<T>(x: T): Wrap<T> {
  return [x] as any;
}
const r = fn<string>("x");
r.at(0);
