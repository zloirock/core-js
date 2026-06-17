import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Promise from "@core-js/pure/actual/promise/constructor";
// nested instance method whose dead residual is eliminated (sole binding, pure init): the whole
// declaration becomes the extracted call, which re-emits the receiver. a global nested in the literal
// receiver must be substituted in that copy too
const m = _flatMaybeArray([1, _Promise]);