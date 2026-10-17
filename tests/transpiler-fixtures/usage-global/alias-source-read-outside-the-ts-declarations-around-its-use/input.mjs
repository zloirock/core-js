// an alias reads its source where it is declared, so a namespace or an enum declared around the use - in
// the namespace or the function the use stands in - does not shadow that read, however it is named: the
// alias, and a container literal holding the name, still hold the global
const A = Array;
const B = A;
namespace N {
  namespace A { export const x = 1; }
  use(B.from(xs));
}
const P = Promise;
export function settled() {
  enum Promise { resolve = 1 }
  return P.resolve(1);
}
const s = (c ? globalThis : other).Array;
const t = s;
namespace M {
  namespace s { export const x = 1; }
  use(t.of(1));
}
const wrapper = { a: Iterator };
namespace W {
  namespace Iterator { export const x = 1; }
  use(wrapper.a.from(xs));
}
