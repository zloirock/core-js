import _includes from "@core-js/pure/actual/instance/includes";
// where the write SITS decides whether it can be trusted: a write inside a deferred callback runs at
// an unknown time - possibly after the use - so the positional "last write" cannot be trusted and
// widening is the CORRECT answer, a negative with both legs kept
declare const arrSrc: string[];
declare const strSrc: string;
declare function later(fn: () => void): void;
export function viaDeferredReassignStaysGeneric() {
  {
    var deferred = arrSrc;
  }
  later(() => {
    // @ts-expect-error the write crosses the declared or narrowed type on purpose, and the read sees the runtime value
    deferred = strSrc;
  });
  {
    var _ref;
    return _includes(_ref = deferred).call(_ref, "x");
  }
}