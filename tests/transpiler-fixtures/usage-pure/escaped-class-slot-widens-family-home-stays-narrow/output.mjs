import _AggregateError from "@core-js/pure/actual/aggregate-error";
import _Map from "@core-js/pure/actual/map";
import _SuppressedError from "@core-js/pure/actual/suppressed-error/constructor";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _URL from "@core-js/pure/actual/url";
// a CLASS is a container like the two literals the escape walk already read: a constructor parked in
// one of its slots leaves the file with the class, so the reference owes the whole static family its
// namespace entry carries. a static field, a class expression's slot and an instance field are each
// a carrier of its own, and a named export takes the class out as a call does. the last two rows pin
// the boundary: a PRIVATE static no reference outside the class can reach, and a class nothing hands
// out - both keep the bare entry
class Registry {
  static Base = _Map;
}
export { Registry };
hand(class {
  static Held = _URL;
});
class Deferred {
  Later = _AggregateError;
}
hand(Deferred);
class Boxed {
  static #Inner = _SuppressedError;
}
hand(Boxed);
class Home {
  static Kept = _Symbol;
}
use(Home.Kept('tag'));