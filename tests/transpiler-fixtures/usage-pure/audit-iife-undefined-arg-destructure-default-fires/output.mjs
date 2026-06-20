import _Array$from from "@core-js/pure/actual/array/from";
// an IIFE invoked with `undefined` falls to the destructure param default `= Array`, so the
// synthesized default carries the polyfilled `from` (Array.from). the undefined-arg path must
// still fire the wrapper-default inject, not bail
(function ({
  from
} = {
  from: _Array$from
}) {
  return from([1, 2, 3]);
})(undefined);