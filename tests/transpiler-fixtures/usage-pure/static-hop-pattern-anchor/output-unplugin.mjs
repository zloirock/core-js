// A STATIC hop whose slot holds a PATTERN with no claim of its own (`{ of: { length: arity } }`)
// destructures the ponyfill itself: the plan anchors the static and the residual reads its pure
// binding (`({ length: arity } = _Array$of)`), on a declarator and on an assignment host alike, off
// the bare realm, `self`, a sequence-prefixed realm and a constructor whose static needs its own
// entry (`Map.groupBy`). A leaf claim beside the pattern keeps its own dispatch (the assignment host
// splits the hop into a declared ref, the overwrite and the residual - the declarator's own shape).
// A default or a rest under the hop keeps the source: the ponyfill is always defined, and a rest
// gathers what no read names. A constructor init anchors the same way (`{ from: { length } } = Array`,
// an alias of it, the member spelling, a static with its own entry). The unplugin sidecar spells one
// accepted asymmetry - the assignment split reads the import binding twice instead of minting a ref
// (the binding is that ref), the overwrite behind the residual. A CALL init the inline canon proves
// to yield the realm anchors on both legs: the call is dropped where it runs no effect and lifted
// ahead of the assignment where it does, so it still evaluates exactly once, where the source ran it.
import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";

const log = [];

function realm() {
	_pushMaybeArray(log).call(log, 'r');

	return _globalThis;
}

const { length: declared } = _Array$of;
let assigned;

({ length: assigned } = _Array$of);

const _ref = _Array$of;
const declaredName = _nameMaybeFunction(_ref);
const { length: declaredTwo } = _ref;
let assignedName, assignedTwo;

({ length: assignedTwo } = _Array$of);
assignedName = _nameMaybeFunction(_Array$of);

const { length: grouped } = _Map$groupBy;

_pushMaybeArray(log).call(log, 'e');

const { length: prefixed } = _Array$of;
const { of: { length: defaulted = 9 } } = _globalThis.Array;
const { of: { ...rest } } = _globalThis.Array;
const { length: beside } = _Array$of;
const from = _Array$from;
const { length: viaSelf } = _Array$of;
let called;

realm();
({ length: called } = _Array$of);

const { length: ctorDeclared } = _Array$from;
let ctorAssigned;

({ length: ctorAssigned } = _Array$from);

const Aliased = Array;
const { length: ctorAlias } = _Array$from;
const { length: ctorMember } = _Array$from;
const { length: ctorEntry } = _Map$groupBy;

export {
	declared,
	assigned,
	declaredName,
	declaredTwo,
	assignedName,
	assignedTwo,
	grouped,
	prefixed,
	defaulted,
	rest,
	beside,
	from,
	viaSelf,
	called,
	log
};

export { ctorDeclared, ctorAssigned, ctorAlias, ctorMember, ctorEntry };