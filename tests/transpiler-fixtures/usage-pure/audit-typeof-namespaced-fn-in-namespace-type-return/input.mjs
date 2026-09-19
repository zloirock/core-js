// `ReturnType<typeof NS.fn>` where fn's declared return references an IN-NAMESPACE type alias
// (`(): Local` with `type Local = number[]` a sibling in NS) must resolve `Local` against NS's
// module body on oxc too (the recovered fn path's scope chain doesn't reach it), narrowing `.at`
namespace NS {
  export type Local = number[];
  export function fn(): Local;
}
type T = ReturnType<typeof NS.fn>;
declare const v: T;
v.at(0);
