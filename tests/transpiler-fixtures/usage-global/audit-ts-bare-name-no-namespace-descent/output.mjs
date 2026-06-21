import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// bare-name type lookup at program scope must NOT descend into nested `namespace N { ... }`
// bodies (that would violate TS lexical scoping). `Box` exists ONLY inside `N`, so the bare
// `Box` annotation is unresolved and `.at(0)` bails to both es.array.at and es.string.at;
// descending would wrongly pick `N.Box`, type `x.items` as string, and drop the array case.
namespace N {
  interface Box {
    items: string;
  }
}
declare const x: Box;
x.items.at(0);