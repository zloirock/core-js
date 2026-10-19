// nor does a rest element: `Awaited<[...Promise<X>[]]>` is the tuple itself, so `t[0]` is
// `Promise<X>` and dispatch stays generic - the fixed-position and optional forms answer the same
type T = Awaited<[...Promise<number[]>[]]>;
declare const t: T;
// @ts-expect-error the member read is the probe, and the right answer is a type without it
function go() { t[0].at(0); }
