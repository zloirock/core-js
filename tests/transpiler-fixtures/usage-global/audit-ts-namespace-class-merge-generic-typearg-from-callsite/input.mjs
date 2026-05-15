// generic namespace function `identity<T>(item: T): T` - return type `T` must be bound
// from the call-site argument's inferred type. resolver routes the merged namespace
// match through `resolveReturnType` so type-param subst from call args propagates
// through the annotation. previously `resolveTypeAnnotation` was called directly,
// leaving T unbound -> dispatch fell to common, over-injecting array.at + string.at
class Box {}
namespace Box {
  export function identity<T>(item: T): T {
    return item;
  }
}

Box.identity('hello').at(0);
