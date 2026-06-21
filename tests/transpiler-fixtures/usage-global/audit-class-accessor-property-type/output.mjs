import "core-js/modules/es.string.repeat";
import "core-js/modules/es.array.at";
import "core-js/modules/es.number.to-fixed";
// TC39 stage-4 auto-accessor (`accessor field: T = ...`) parses as `AccessorProperty`
// in ESTree/oxc and `ClassAccessorProperty` in babel; type-member lookup must handle both.
// the oxc shape was missing, so typed accessors fell to a generic fallback emitting both
// variants. distinct targets (.at on number[] vs .toFixed on number) pin es.array.at + number.toFixed only.
class Foo {
  accessor items: number[] = [];
  accessor value: number = 0;
}
declare const f: Foo;
f.items.at(-1);
f.value.toFixed(2);