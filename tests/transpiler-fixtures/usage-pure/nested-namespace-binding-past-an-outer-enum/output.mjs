import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// The closest declaration determines the receiver, across the surrounding enum scope.
namespace Outer {
  enum u {
    A
  }
  namespace Inner {
    const u = [1];
    _atMaybeArray(u).call(u, 0);
  }
}