import "core-js/modules/es.string.at";
// Generic function in a merged namespace: `identity<T>(item: T): T`. The return
// type `T` must be bound from the call-site argument. `Box.identity('hello')`
// passes a string literal, so the return narrows to `string` and `.at(0)` must
// emit only `es.string.at` - not the cross-type Array+String fallback that would
// appear if `T` stayed unbound.
class Box {}
namespace Box {
  export function identity<T>(item: T): T {
    return item;
  }
}
Box.identity('hello').at(0);