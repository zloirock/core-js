// `static set value(v)` without a paired getter owns the slot. class-member resolution used
// to skip the setter and fall through to a same-named function in the merged namespace,
// routing dispatch through ITS `string[]` return (`_atMaybeArray`). but `Holder.value()` is
// a runtime TypeError, so the setter slot must win and dispatch returns null (generic `_at`).
class Holder {
  static set value(v: string[]) { /* sink */ }
}
namespace Holder {
  export function value(): string[] { return ['ns']; }
}
Holder.value().at(0);
