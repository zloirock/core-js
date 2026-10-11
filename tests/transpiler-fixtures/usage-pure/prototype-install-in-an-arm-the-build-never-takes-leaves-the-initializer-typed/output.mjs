import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Map from "@core-js/pure/actual/map/constructor";
import _padEndMaybeString from "@core-js/pure/actual/string/instance/pad-end";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// an install of a dispatching prototype in an arm the build never takes never runs, so the binding keeps
// the family its initializer built - under an `if`, an `&&`, a ternary and an `||` alike - while an
// install in the arm it always takes names the installed family. the presence tests load the `Symbol`
// modules and `new Map()` its family; distinct method per line
const list = [1];
if (typeof _Symbol == 'undefined') Object.setPrototypeOf(list, String.prototype);
use(_includesMaybeArray(list).call(list, 1));
const map = new _Map();
use(map.at(0));
const kept = [1];
if (typeof _Symbol != 'undefined') Object.setPrototypeOf(kept, String.prototype);
use(_padEndMaybeString(kept).call(kept, 3));
const picked = [1];
use(_findLastMaybeArray(picked).call(picked, Boolean));
const fallen = [1];
use(_flatMaybeArray(fallen).call(fallen));