// A qualified enum retains its own member when only that member value changes.
namespace N {
  export enum E {
    at = "at"
  }
}
// @ts-expect-error a write to an enum, which tsc forbids, is the shape under test
N.E.at = other;
use(N.E.at);