import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
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
  P: Promise
};
try {
  f();
} catch (e) {
  enum box {
    P = 1
  }
  const a = box;
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  {
    const {
      P
    } = a;
    use(P.try(f));
  }
}
use(A.from(xs));