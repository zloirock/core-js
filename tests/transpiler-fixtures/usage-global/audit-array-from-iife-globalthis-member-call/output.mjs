import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// proxy-global static call whose receiver is an IIFE-returned proxy-global
// (`(function(){return globalThis})().Array`); the member chain resolves so `Array.from`
// injects its dep, same as a bare `globalThis.Array.from(...)` call
(function () {
  return globalThis;
})().Array.from([1, 2, 3]);