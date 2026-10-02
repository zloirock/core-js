// A qualified enum retains its own member when only that member value changes.
namespace N {
  export enum E {
    at = "at",
  }
}
N.E.at = other;
use(N.E.at);