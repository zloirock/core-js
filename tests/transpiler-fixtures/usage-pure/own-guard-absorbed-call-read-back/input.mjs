// a guard over a CALL moves the invocation into every branch (`h === Array ? _Array$of(1) : h.of(1)`),
// so a source already carrying that render names the static through the consequent's CALLEE, not as
// a bare binding. the census reads it there and stands the alternate's claim down - claimed again,
// the guard would gain a level per pass. the function rows are the render over a receiver captured
// first and a call the chain continues past; the cast rows, a type-only wrapper a pre-polyfilled TS
// source may wear around the call or its callee. what the stand-down turns on is still the TEST: another
// member under the same test is off limits, a test against another global settles nothing, and a
// consequent calling anything but a pure import is no render at all - both keep their claim.
// the receiver is read off the realm on one path only, so the claim is live and the value open; `Array`
// is the global core-js never replaces, so the render tests the bare name
import _Array$of from '@core-js/pure/actual/array/of';
import _Array$from from '@core-js/pure/actual/array/from';
let h;
if (flag) ({ Array: h } = globalThis);
export const ownRender = h === Array ? _Array$of(1, 2) : h.of(1, 2);
export function capturedReceiver() {
  var _ref;
  return _ref = h, _ref === Array ? _Array$of(1, 2) : _ref.of(1, 2);
}
export function chainTail() {
  return (h === Array ? _Array$from([1]) : h.from([1])).length;
}
export const calleeCast = h === Array ? (_Array$of as any)(1, 2) : h.of(1, 2);
export const callCast = h === Array ? (_Array$of(1, 2) as any) : h.of(1, 2);
export const foreignMember = h === Array ? _Array$of(1, 2) : h.from([1]);
export const foreignGuardName = h === Object ? _Array$of(1, 2) : h.of(1, 2);
export const notARender = h === Array ? make(1, 2) : h.of(1, 2);
