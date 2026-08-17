// nor does a rest element: `Awaited<[...Promise<X>[]]>` is the tuple itself, so `t[0]` is
// `Promise<X>` and dispatch stays generic - the fixed-position and optional forms answer the same
type T = Awaited<[...Promise<number[]>[]]>;
declare const t: T;
function go() {
  t[0].at(0);
}