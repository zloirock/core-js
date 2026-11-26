// Chrome 100 has Array.prototype.at. Both math methods need a polyfill, and the callback excludes sumPrecise.
import "core-js/modules/es.math.f16round";