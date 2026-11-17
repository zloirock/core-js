import "core-js/modules/es.array.at";
// The closest declaration determines the receiver, across the surrounding enum scope.
namespace Outer {
  enum u {
    A
  }
  namespace Inner {
    const u = [1];
    u.at(0);
  }
}