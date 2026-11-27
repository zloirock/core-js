import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref;
// String conversion fixes the receiver of both reads. The reverse lookup reads the qualified enum itself.
namespace NS {
  export enum E {
    A,
    B
  }
}
declare const v: NS.E;
const tag = String(v);
_atMaybeString(tag).call(tag, 0);
// @ts-expect-error the member read is the probe, and the right answer is a type without it
tag.findLast(c => c === 'A');
_includesMaybeString(_ref = NS.E[NS.E.B]).call(_ref, 'B');