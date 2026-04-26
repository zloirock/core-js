import _includes from "@core-js/pure/actual/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
// three identical inner-rewrite sites pointing at the same source object: each
// occurrence must be replaced independently with the right alias.
_includes(arr).call(arr, _at(arr).call(arr, 0), _at(arr).call(arr, 0), _at(arr).call(arr, 0));