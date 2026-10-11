import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// an alias reads its source where it is declared, so a namespace or an enum declared around the use - in
// the namespace or the function the use stands in - does not shadow that read, however it is named: the
// alias, and a container literal holding the name, still hold the global
const A = Array;
const B = A;
namespace N {
  namespace A {
    export const x = 1;
  }
  use(_Array$from(xs));
}
const P = _Promise;
export function settled() {
  enum Promise {
    resolve = 1,
  }
  return _Promise$resolve(1);
}
const s = (c ? _globalThis : other).Array;
const t = s;
namespace M {
  namespace s {
    export const x = 1;
  }
  use((t, t === Array ? _Array$of(1) : t.of(1)));
}
const wrapper = {
  a: _Iterator
};
namespace W {
  namespace Iterator {
    export const x = 1;
  }
  use(_Iterator$from(xs));
}