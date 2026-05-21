// `static set value(v)` without a paired getter owns the slot. resolveClassMember used to
// fall through to resolveMergedNamespaceStatic when findClassMember returned null
// (kind==='set' skip), then match a same-named function in the merged namespace and
// route polyfill emission through ITS return type. observable target: calling `Holder.value
// ()` is a runtime TypeError (setter-only read returns undefined), but the over-eager
// fallback resolved it as namespace function -> string[] return -> _atMaybeArray. with the
// hasOwnAccessor gate the setter slot wins and dispatch returns null (generic narrow only)
class Holder {
  static set value(v: string[]) { /* sink */ }
}
namespace Holder {
  export function value(): string[] { return ['ns']; }
}
Holder.value().at(0);
