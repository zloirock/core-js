// Chrome 100 has Array.prototype.at. Both math methods need a polyfill, and the callback excludes sumPrecise.
import 'core-js/actual/array/at';
import 'core-js/actual/math/f16round';
import 'core-js/actual/math/sum-precise';
