import "core-js/modules/es.array.includes";
import "core-js/modules/es.global-this";
// usage-global counterpart of the destructured-global superclass narrow: the instance
// method should pull in the array `includes` polyfill at file level even though the proxy
// global was rewritten to its UID before the superclass was resolved.
const {
  Array
} = globalThis;
class X extends Array {}
new X().includes(0);