// A destructure off a nav INTO the built-in namespace whose root is a call the census resolves to a
// realm: the discarded init keeps the call alone where it bears effects - its hops are dead reads,
// and their fold printed a bare ponyfill read (`realm(), _Map;`) with an import for nothing.
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";

var _ref;

function realm() {
	_pushMaybeArray(log).call(log, 'r');

	return _globalThis;
}

function quiet() {
	return _globalThis;
}

realm();

export const fromCall = _Map$groupBy;

(0, realm)();

export const fromParenCall = _Map$groupBy;
export const fromQuiet = _Map$groupBy;

realm();

export const fromNoEntry = _Array$of;

let assigned;

realm();
assigned = _Map$groupBy;

export { assigned };

// A nested INSTANCE leaf under a hop off a call the inline canon proves to yield a proxy global,
// running no effect on the way (`const g = () => globalThis`): the call reads as that global on both
// legs - the nav folds onto `_globalThis`, the discarded call owes nothing - beside a static sibling,
// under a sequence prefix (lifted, once), alone, and with a live default.
let eff = 0;

const g = () => _globalThis;
const staticBeside = _Array$of;
const nestedBesideStatic = _flatMaybeArray(_globalThis.Array.prototype);

eff++;

const nestedSeBesideStatic = _flatMaybeArray(_globalThis.Array.prototype);
const staticSeBeside = _Array$of;
const nestedSeSole = _flatMaybeArray((eff++, _globalThis.Array.prototype));
const nestedSole = _flatMaybeArray(_globalThis.Array.prototype);

eff++;

const nestedDefaulted = (_ref = _flatMaybeArray(_globalThis.Array.prototype)) === void 0
	? ({ "nestedDefaulted": () => 1 })["nestedDefaulted"]
	: _ref;

const staticDefaultedBeside = _Array$of;

export {
	eff,
	nestedBesideStatic,
	staticBeside,
	nestedSeBesideStatic,
	staticSeBeside,
	nestedSeSole,
	nestedSole,
	nestedDefaulted,
	staticDefaultedBeside
};