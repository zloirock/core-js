import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.math.log2";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
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
import "core-js/modules/es.string.from-code-point";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.raw";
import "core-js/modules/web.dom-collections.iterator";
// An array literal a call returns is a container of the binding that holds it: a slot write, a length
// truncation or a handout through that binding replaces what the literal spelled, so the read off the
// written slot stays native, while the untouched twin still extracts the static off the literal. the
// handed-out container carries its constructor out whole, so it holds one no other row reads
const make = () => [String, 0];
const written = make();
written[0] = {};
const [{
  fromCodePoint: viaWritten
} = {}] = written;
const truncated = make();
truncated.length = 0;
const [{
  raw: viaTruncated
} = {}] = truncated;
const handOut = () => [Math, 0];
const handed = handOut();
hand(handed);
const [{
  trunc: viaHanded
} = {}] = handed;
const kept = () => [Array, 0];
const [{
  of: viaKept
} = {}] = kept();
export { viaWritten, viaTruncated, viaHanded, viaKept };