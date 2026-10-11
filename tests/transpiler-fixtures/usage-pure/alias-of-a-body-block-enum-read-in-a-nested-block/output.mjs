import _Array$from from "@core-js/pure/actual/array/from";
import _Promise from "@core-js/pure/actual/promise/constructor";
// an enum declared in a catch body or a loop body binds its name in that block, so an alias declared there
// beside it holds the enum - also where the alias is read from a nested block or a closure, or destructured
// as a container there. a read of the name outside the block still reaches the outer binding
const A = Array;
try {
  f();
} catch (e) {
  enum A {
    of = 1
  }
  const B = A;
  {
    use(B.of);
  }
}
for (const x of xs) {
  enum A {
    fromAsync = 1
  }
  const B = A;
  use(() => B.fromAsync);
}
const box = {
  P: _Promise
};
try {
  f();
} catch (e) {
  enum box {
    P = 1
  }
  const a = box;
  {
    const {
      P
    } = a;
    use(P.try(f));
  }
}
use(_Array$from(xs));