// type narrowing bails where the lexical declaration cannot speak for the runtime slot.
// a namespace merged onto a subclass attaches runtime statics AFTER the class definition,
// overriding the inherited slot - this-rooted static reads fall back to the generic dispatcher
class Base {
  static make(): number[] { return [1]; }
  static m() { return this.make().at(0); }
}
class Sub extends Base {}
namespace Sub {
  export function make(): string { return 's'; }
}
use(Base.m(), Sub.make());
// an enum member initialized by a comparison yields a runtime BOOLEAN regardless of
// operand kinds (invalid TS, but a non-type-checking parse still transforms) - no string narrow
enum E { C = 'a' < 'b' }
use(E.C.includes('x'));
// every non-`+` arithmetic operator COERCES to a number (`'3' * '2'` is 6) - operand
// kinds must not leak a string narrow onto the numeric runtime value
enum E2 { N = '3' * '2' }
use(E2.N.padStart(2));
// bigint operands flow through the shared operator table - the member is KNOWN bigint,
// so a string-only method name must not inject anything
enum E3 { B = 1n * 2n }
use(E3.B.padEnd(2));
// `typeof` always yields a string - the member narrows and the string method polyfills
enum E4 { T = typeof globalThis }
use(E4.T.trimStart());
// a member referencing another member is unresolvable per se, but coercing arithmetic
// still yields a KNOWN number - the string method must not inject
enum E5 { A = 1, B = A * 2 }
use(E5.B.normalize());
// the `in` operator yields a boolean - a known non-string suppresses the injection
declare const obj: object;
const cmpIn = 'k' in obj;
use(cmpIn.codePointAt(0));
