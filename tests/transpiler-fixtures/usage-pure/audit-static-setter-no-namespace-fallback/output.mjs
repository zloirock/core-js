import _at from "@core-js/pure/actual/instance/at";
var _ref;
// `static set value(v)` without a paired getter owns the slot. class-member resolution used
// to skip the setter and fall through to a same-named function in the merged namespace,
// routing dispatch through ITS `string[]` return (`_atMaybeArray`). but `Holder.value()` is
// a runtime TypeError, so the setter slot must win and dispatch returns null (generic `_at`).
class Holder {
  // @ts-expect-error merged declarations tsc refuses are the shape under test
  static set value(v: string[]) {/* sink */}
}
namespace Holder {
  // @ts-expect-error merged declarations tsc refuses are the shape under test
  export function value(): string[] {
    return ['ns'];
  }
}
// @ts-expect-error a call through a value tsc cannot call is the shape under test
_at(_ref = Holder.value()).call(_ref, 0);