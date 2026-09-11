// proxy-global static call whose receiver is an IIFE-returned proxy-global
// (`(function(){return globalThis})().Array`); the member chain resolves so `Array.from`
// injects its dep, same as a bare `globalThis.Array.from(...)` call
(function () { return globalThis; })().Array.from([1, 2, 3]);
