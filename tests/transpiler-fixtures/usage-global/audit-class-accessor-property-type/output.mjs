import "core-js/modules/es.string.repeat";
import "core-js/modules/es.array.at";
import "core-js/modules/es.number.to-fixed";
// TC39 stage-4 auto-accessor (`accessor field: T = ...`) parses as `AccessorProperty`
// in ESTree/oxc and `ClassAccessorProperty` in babel. findTypeMember's switch must list
// both - the oxc shape was missing, so `declare const f: Foo` with typed accessors fell
// through to the generic member fallback and emitted both array and string variants.
// Distinct narrow targets (.at on number[] vs .toFixed on number) make the per-accessor
// type-resolution observable: array.at + number.toFixed only, no overlapping string.at.
class Foo {
  accessor items: number[] = [];
  accessor value: number = 0;
}
declare const f: Foo;
f.items.at(-1);
f.value.toFixed(2);