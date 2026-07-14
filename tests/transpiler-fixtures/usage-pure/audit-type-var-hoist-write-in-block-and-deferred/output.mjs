import _includes from "@core-js/pure/actual/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// where the write SITS decides whether it can be trusted: a write next to the declarator is ordered
// before the use, so the type follows it to a string. a write inside a deferred callback runs at an
// unknown time - possibly after the use - so the positional "last write" cannot be trusted and
// widening is the CORRECT answer, which makes the second row a negative with both legs kept
declare const arrSrc: string[];
declare const strSrc: string;
declare function later(fn: () => void): void;
export function viaReassignedInsideBlock() {
  {
    var inner = arrSrc;
    inner = strSrc;
  }
  {
    return _atMaybeString(inner).call(inner, 0);
  }
}
export function viaDeferredReassignStaysGeneric() {
  {
    var deferred = arrSrc;
  }
  later(() => {
    deferred = strSrc;
  });
  {
    return _includes(deferred).call(deferred, "x");
  }
}