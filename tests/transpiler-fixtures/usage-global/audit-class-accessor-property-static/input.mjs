// `static accessor field: T = ...` carries its typeAnnotation on the same AccessorProperty
// shape (just `static: true`). Static class member lookup must dispatch through the same
// findTypeMember branch as instance members - the oxc shape was missing from the switch
// label list. Distinct .at / .toFixed split per typed slot makes the static-path narrowing
// observable independent of instance access.
class Foo {
  static accessor items: number[] = [];
  static accessor value: number = 0;
}
Foo.items.at(-1);
Foo.value.toFixed(2);
