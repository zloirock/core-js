import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.math.log2";
import "core-js/modules/es.global-this";
import "core-js/modules/es.math.acosh";
import "core-js/modules/es.math.asinh";
import "core-js/modules/es.math.atanh";
import "core-js/modules/es.math.cbrt";
import "core-js/modules/es.math.clz32";
import "core-js/modules/es.math.cosh";
import "core-js/modules/es.math.expm1";
import "core-js/modules/es.math.fround";
import "core-js/modules/es.math.f16round";
import "core-js/modules/es.math.hypot";
import "core-js/modules/es.math.imul";
import "core-js/modules/es.math.log10";
import "core-js/modules/es.math.log1p";
import "core-js/modules/es.math.sign";
import "core-js/modules/es.math.sinh";
import "core-js/modules/es.math.sum-precise";
import "core-js/modules/es.math.tanh";
import "core-js/modules/es.math.to-string-tag";
import "core-js/modules/es.math.trunc";
// a namespace read as a VALUE escapes: `Math` handed to a binding pulls the whole `es.math.*`
// family, `@@toStringTag` included, since nothing bounds what the escaped value is asked for.
// the guard beside it is the other channel: an existence test of the namespace pins `globalThis`
// alone
export const supported = globalThis.Math ? 'yes' : 'no';
export const escaped = Math;