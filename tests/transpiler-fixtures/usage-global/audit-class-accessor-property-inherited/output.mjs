import "core-js/modules/es.string.repeat";
import "core-js/modules/es.array.at";
import "core-js/modules/es.number.to-fixed";
// Subclass-inherited accessor: `class Bar extends Foo {}` carries no own member, the
// type resolver walks the extends chain back to Foo and reads the typed accessor there.
// AccessorProperty shape on the parent must still narrow the receiver type for `b.items`
// access through the subclass binding. Distinct .at / .toFixed per typed slot keeps the
// inherited-member narrowing observable.
class Foo {
  accessor items: number[] = [];
  accessor value: number = 0;
}
class Bar extends Foo {}
declare const b: Bar;
b.items.at(-1);
b.value.toFixed(2);