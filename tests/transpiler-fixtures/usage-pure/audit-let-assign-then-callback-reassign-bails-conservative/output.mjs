import _at from "@core-js/pure/actual/instance/at";
var _ref;
// reassignment INSIDE a callback body is deferred (closure-captured, runs only when the
// callback is invoked) - the source-position window check still catches it because the
// closure's source span sits between the candidate hit and the use site. this is the
// over-conservative side of the position-only check: even though `() => { f = ... }` is
// never invoked here, the position-window can't tell. acceptable trade-off vs the
// alternative (false narrow when the callback IS invoked between the hit and the use)
let f;
f = {
  data: [1, 2, 3]
};
[1].forEach(() => {
  f = {
    data: 'string'
  };
});
_at(_ref = f.data).call(_ref, -1);