import "core-js/modules/es.array.at";
import "core-js/modules/es.string.includes";
// @flow
// Flow's ambient class parks its super type arguments on the heritage clause, not on the
// class-side super-type slots, so a walker that probes only those slots loses the argument and
// every inherited generic member widens back to the unbound parameter. Distinct methods pin the
// two narrows: Array -> es.array.at, string -> es.string.includes.
declare class Box<T> {
  items(): Array<T>,
  label(): T,
}
declare class NumberBox extends Box<Array<number>> {}
declare class StringBox extends Box<string> {}
declare var boxedNumbers: NumberBox;
declare var boxedString: StringBox;
boxedNumbers.items()[0].at(0);
boxedString.label().includes('x');