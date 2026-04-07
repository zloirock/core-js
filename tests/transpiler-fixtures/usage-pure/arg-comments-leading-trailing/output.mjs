import _includes from "@core-js/pure/actual/instance/includes";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
_includes(arr).call(arr, /* needle */x);
_flatMaybeArray(arr).call(arr) /* hint */;
_includes(arr).call(arr, x /* trailing */);