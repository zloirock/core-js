import _at from "@core-js/pure/actual/instance/at";
var _ref;
// A file-visible Object.prototype write invalidates the inherited Function proof.
// The nested receiver must keep dispatch for the installed array value.
Object.prototype.toString = [1, 2];
use(_at(_ref = {}.toString).call(_ref, -1));