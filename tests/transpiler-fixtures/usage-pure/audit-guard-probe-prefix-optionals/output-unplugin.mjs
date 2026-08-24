// a SECOND unresolvable hop below the collapse (`window?.window` - the realm self-reference
// past the environment probe): the guard tests the DEEPER prefix, so the `?.` inside that test
// guards the probe itself and is LOAD-BEARING. spelling the test with the whole spine plain
// read `.window` off an absent probe - a TypeError where the source yields undefined
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Map from "@core-js/pure/actual/map";
import _self from "@core-js/pure/actual/self";

var _ref,
	_ref2,
	_ref3,
	_ref4,
	_ref5,
	_ref6,
	_ref7,
	_ref8,
	_ref9,
	_ref10,
	_ref11,
	_ref12,
	_ref13,
	_ref14,
	_ref15,
	_ref16,
	_ref17,
	_ref18,
	_ref19,
	_ref20,
	_ref21,
	_ref22,
	_ref23,
	_ref24,
	_ref25;

export const bareRootTwoHops = null == (_ref = null == _globalThis.window?.window ? void 0 : _self)
	? void 0
	: _atMaybeArray(_ref2 = _Array$of(1)).call(_ref2, 0);

export const optionalRootTwoHops = null == (_ref3 = null == _globalThis.window?.window ? void 0 : _self)
	? void 0
	: _atMaybeArray(_ref4 = _Array$of(2)).call(_ref4, 0);

const dr = () => _globalThis;

export const provenRootTwoHops = null == (_ref5 = null == dr().window?.window ? void 0 : _self)
	? void 0
	: _atMaybeArray(_ref6 = _Array$of(3)).call(_ref6, 0);

// the `?.` over a PROVEN root is dead text in the very same test - both emitters drop it, and
// the load-bearing one above the probe survives beside it
const sr = () => _globalThis;

export const provenRootOneHop = null == (_ref7 = null == sr().window ? void 0 : _self)
	? void 0
	: _atMaybeArray(_ref8 = _Array$of(4)).call(_ref8, 0);

// a CHAIN-ASSIGN root under an INSTANCE dispatch: the memo binds the value the guard tests, so
// it must keep the probe hop. binding the bare write folded the hops out of the test, leaving
// an always-defined global under the null-check (the branch ran where the source short-circuits)
let held;

export const chainAssignInstance = null == (_ref9 = null == (held = _globalThis).window ? void 0 : _self) ? void 0 : _at(_ref10 = _Array$of(5)).call(_ref10, 0);

let heldDeep;

export const chainAssignInstanceTwoHops = null == (_ref11 = null == (heldDeep = _globalThis).window?.window ? void 0 : _self) ? void 0 : _at(_ref12 = _Array$of(6)).call(_ref12, 0);

let heldPlainHop;

export const chainAssignPlainHop = null == (_ref13 = null == (heldPlainHop = _globalThis).window?.window ? void 0 : _self) ? void 0 : _at(_ref14 = _Array$of(7)).call(_ref14, 0);
export { held, heldDeep, heldPlainHop };

// the same chain-assign root with a receiver-INDEPENDENT claim (no memo): the guard shape is
// the plain probe test in both emitters, the write riding inside it
let heldStatic;

export const chainAssignStatic = null == (heldStatic = _globalThis).window ? void 0 : _Array$of(8);
export { heldStatic };

// a chain-assign root whose hops ALL resolve keeps the fold: no hop can be undefined, so the
// write is the whole kept prefix and the leaf reads off the ponyfill
let heldResolvable;

export const chainAssignResolvableHops = _at(_ref15 = (heldResolvable = _globalThis, _Array$of)(9)).call(_ref15, 0);
export { heldResolvable };

// NEGATIVE: a CONDITIONALLY proven callee (a single conditional assignment) proves no value -
// the unassigned path yields undefined through the call's own `?.()`, exactly what the outer
// `?.` guards, so both optionals stay live
let maybeFn;

if (_globalThis.setTimeout) maybeFn = () => _globalThis;

export const conditionalCalleeKeepsGuards = null == (_ref16 = null == maybeFn?.()?.window ? void 0 : _self)
	? void 0
	: _atMaybeArray(_ref17 = _Array$of(10)).call(_ref17, 0);

// NEGATIVE: an OPTIONAL call is a chain LINK, not a plain value - dropping the `?.` above it
// re-groups the chain, so the source spelling stays even though the callee is proven
const provenFn = () => _globalThis;

export const optionalCallLinkKeepsGuard = null == (_ref18 = null == provenFn?.()?.window ? void 0 : _self)
	? void 0
	: _atMaybeArray(_ref19 = _Array$of(11)).call(_ref19, 0);

// NEGATIVE: an OPAQUE call root is a genuine source of undefined - its `?.` is load-bearing and
// the chain keeps the raw guarded read off the memo
const opaque = () => ({ window: { self: { Array } } });

export const opaqueRootKeepsGuard = null == (_ref20 = opaque()?.window?.self)
	? void 0
	: _at(_ref21 = _ref20.Array.of(12)).call(_ref21, 0);

// hops the plan does NOT cover (a non-proxy name) read off the value the render produces:
// while that value is provably defined they belong INSIDE the guarded alternate, so no `?.`
// survives for the ES5 lowering to memoize. the FIRST one pulls whatever its spelling, PLAIN
// ones keep pulling, and the first LIVE `?.` stays outside where the ternary already guards
const ut = () => _globalThis;

export const unplannedOptionalTail = null == (_ref22 = null == ut().window ? void 0 : _self.chrome)
	? void 0
	: _at(_ref23 = _ref22.Array.of(13)).call(_ref23, 0);

export const unplannedPlainTail = null == ut().window ? void 0 : _self.chrome.Array;
export const unplannedComputedTail = null == ut().window ? void 0 : _self['chrome'];
export const unplannedTwoTails = (null == ut().window ? void 0 : _self.chrome)?.foo?.Array;
export const unplannedPlainChain = null == ut().window ? void 0 : _self.chrome.foo.Array;

// the CALL comes along or the receiver is lost: invoked off the ternary the callee reads as a
// bare value and `this` binds to undefined where the source binds the hop. the fold TAKES the
// continuation even when it sits past the receiver span both emitters started from
export const unplannedCallTail = null == ut().window ? void 0 : _self.chrome.foo(1);

export const unplannedOptionalCall = (null == ut().window ? void 0 : _self.chrome)?.foo(2);
export const unplannedCallThenMember = null == ut().window ? void 0 : _self.foo().bar;
export const unplannedDeepCallChain = null == ut().window ? void 0 : _self.foo(1).bar.baz(2);

// NEGATIVE: `delete` needs the MEMBER itself - pulled into the alternate the ternary evaluates
// and deletes nothing, so the tail rides outside behind `?.`
export const unplannedDelete = delete (null == ut().window ? void 0 : _self)?.chrome;

// a `new` callee reads only the VALUE (no receiver binding), so it pulls like a plain tail
export function unplannedNewCallee() {
	return new (null == ut().window ? void 0 : _self.CustomCtor)(1);
}

// a pulled tail ENDS in the ternary, so an operator continuing the expression needs the parens
// (`?? 'absent'` would otherwise bind to the alternate and never see the guarded branch)
export const unplannedNullishCarrier = (null == ut().window ? void 0 : _self.chrome) ?? 'absent';

// NEGATIVE: a SEALED read above the guard keeps the source throw - the seal ended the chain,
// so the plain read observes the short-circuited value instead of riding it
export const sealedUnplannedTail = (null == ut().window ? void 0 : _self).chrome;

// a planned tail of its own (`_self.window`) still folds the FIRST live `?.` above it: while
// every pulled step is a straight continuation of the leaf the alternate produces the same
// value the source reads. the SECOND guard has a step with its own `?.` behind it and stays out
export const plannedTailKeepsGuard = (null == ut().window ? void 0 : _self.window)?.chrome?.Array;

// a render that ends in a hop of its OWN (`_self.window`) is not the ponyfill leaf, but the
// tail still folds in: the hops the render emitted are marked, so the re-traversal keeps the
// shape the plan chose instead of collapsing them against a receiver it never picked
const rt = () => _globalThis;

export const renderTailPlainContinuation = null == rt().window ? void 0 : _self.window.chrome;
export const renderTailFirstOptionalFolds = (null == rt().window ? void 0 : _self.window)?.chrome;
export const renderTailDeepPlain = null == rt().window ? void 0 : _self.window.chrome.foo;

// the same render under an INSTANCE dispatch receiver keeps its hops too (the receiver-collapse
// drive must not re-run on them)
let rc = 0;

export const renderTailInstanceRecv = (rc++, rt()?.window?.self.window).Array.prototype.indexOf.call([5], 5);
export { rc };

// an OPTIONAL call on the pulled tail keeps its `?.(` INSIDE the alternate: hung off the
// ternary the callee reads as a bare value and `this` binds to undefined where the source
// binds the member it was read from
const oc2 = () => _globalThis;

export const pulledOptionalCall = null == oc2().window ? void 0 : _self.chrome.foo?.(1);
export const pulledOptionalCallThenMember = null == oc2().window ? void 0 : _self.chrome.foo?.(2).bar;
export const pulledSpreadCall = null == oc2().window ? void 0 : _self.chrome.foo(...[3]);

export function pulledNewCallee() {
	return new (null == oc2().window ? void 0 : _self.chrome.Ctor)(4);
}

// `delete` over a pulled tail: the operand must stay a member read behind `?.` - folded into
// the alternate the ternary deletes nothing, and a tail left outside reads off the guard's
// `void 0` (a throw where the source short-circuits to a no-op `true`)
const dl = () => _globalThis;

export const deleteOverPulledTail = delete (null == dl().window ? void 0 : _self)?.chrome.missing;
export const deleteDirectTail = delete (null == dl().window ? void 0 : _self)?.missing;
export const deleteOptionalTail = delete (null == dl().window ? void 0 : _self)?.chrome?.missing;

// the same `delete` rule on a BARE proxy root (no call around it): the operand keeps its `?.`
// whatever number of tail steps sit between the guard and the operator
_globalThis.deleteNest = { key: 1 };

export const deleteBareRootDeepTail = delete _globalThis.deleteNest.key;
export const deleteBareRootDirect = delete _globalThis.deleteNest;

// a consumer that PARENTHESIZES the guard (`await`, an operator) wraps the WHOLE folded value,
// so the tail rides inside it entire - no step is stranded outside, and no `?.` the source never
// had is introduced over an intermediate the source reads plainly
const aw = () => _globalThis;

export const awaitedDeepTail = async () => await (null == aw().window ? void 0 : _self.host.probe);
export const awaitedSingleTail = async () => await (null == aw().window ? void 0 : _self.host);
export const carrierDeepTail = (null == aw().window ? void 0 : _self.host.probe) ?? 'absent';
export const operandTail = ((null == aw().window ? void 0 : _self.host.count) ?? 0) + 1;

// assignment / update / destructure targets need the member itself, and a SEALED read keeps
// the source's own throw - the tail never folds there
_globalThis.slotHost = { n: 1 };

export function assignThroughGuard() {
	(null == aw().window ? void 0 : _self).slotHost.n = 10;
}

export function updateThroughGuard() {
	(null == aw().window ? void 0 : _self).slotHost.n++;
}

export function destructureThroughGuard() {
	[(null == aw().window ? void 0 : _self).slotHost.n] = [7];
}

// consumer contexts around the guard: a ternary TEST and an operator parenthesize it, while a
// class field / sequence / for-of element do not - either way the tail rides inside
_globalThis.consumerHost = { n: 1, list: [1] };

const cs = () => _globalThis;

export const ternaryTestConsumer = (null == cs().window ? void 0 : _self.consumerHost.n) ? 'y' : 'n';

export const whileConsumer = () => {
	while ((null == cs().window ? void 0 : _self.consumerHost.n) > 100) break;
};

export const sequenceConsumer = (0, null == cs().window ? void 0 : _self.consumerHost.n);

class ConsumerHost {
	static field = null == cs().window ? void 0 : _self.consumerHost.n;

	inst = null == (_ref24 = cs()?.window)
		? void 0
		: _at(_ref25 = _ref24.consumerHost.list).call(_ref25, 0);
}

export const consumerHost = ConsumerHost;

// PARENS between the callee and its call end the chain: the source throws on a nullish value
// there, so the call never joins the alternate (folding it would swallow that throw and hand
// the callee a receiver the source does not give it)
_globalThis.parenHost = {
	fn(x) {
		return x;
	},
	Ctor: _Map
};

const pc = () => _globalThis;

export const parenCalleeStaysOutside = ((null == pc().window ? void 0 : _self)?.parenHost.fn)(2);
export const parenCalleeSealed = (null == pc().window ? void 0 : _self).parenHost.fn(3);

export function newOverPulledTail() {
	return new (null == pc().window ? void 0 : _self.parenHost.Ctor)();
}

// a TAGGED template reads its tag as a REFERENCE (`(w?.self.tag)`x`` binds `this`), so the tail
// stays outside - but behind a `?.`, and inside the source's own parens. read PLAIN it throws on
// the very branch the guard proved absent, before the template's substitutions ever run, while
// the source short-circuits the whole tag and throws only at the call
_globalThis.tagHost = {
	tag(strings) {
		return strings[0];
	}
};

const tg = () => _globalThis;

export const taggedTemplateTail = ((null == tg().window ? void 0 : _self)?.tagHost.tag)`x`;

// a migrated hop-key SE wraps the BINDING only - the tail reads off its value, so the sequence
// parens close before it (`(se, _self).tail`). a SE-keyed hop IN the tail keeps its own span
let seK = 0;

_globalThis.seKeyHost = { w: { c: 1 } };

const sk2 = () => _globalThis;

export const seKeyThenPlainTail = null == sk2().window ? void 0 : (seK++, _self).seKeyHost.w.c;
export const seKeyDeleteTail = delete (null == sk2().window ? void 0 : (seK++, _self))?.seKeyHost.w.c;
export { seK };

// an OPAQUE computed key carries its own effects and migration canon: the fold stops there in
// both emitters, so the key keeps its single evaluation on the guarded branch
let ck2 = 0;

_globalThis.ckHost = { a: 1 };

const ckr = () => _globalThis;

export const opaqueComputedKeyTail = (null == ckr().window ? void 0 : (ck2++, _self).window)?.[(ck2++, 'ckHost')]?.a;
export const opaqueComputedKeyPlain = null == ckr().window ? void 0 : _self[(ck2++, 'ckHost')].a;
export { ck2 };

// a PLAIN step followed by a live `?.`: while every step so far was plain the folded value is a
// straight continuation of the leaf, so that first `?.` still rides INSIDE the alternate
const pf = () => _globalThis;

export const plainThenLiveOptional = null == pf().window ? void 0 : _self.chrome?.foo.bar;

// an opaque computed key with no EFFECTS folds like any other step - only a key carrying its
// own effects keeps its migration canon (and its own span) outside the fold
_globalThis.metaHost = { a: 1, b: 2 };

const mt = () => _globalThis;

export const opaqueKeyNoEffects = null == mt().window ? void 0 : _self.metaHost[_globalThis.flag ? 'a' : 'b'];
export const opaqueKeyRuntimeValue = null == mt().window ? void 0 : _self.metaHost[String('a')];

// BARE proxy root (no call around it) with an optional tail: the two emitters pick different
// channels for it, so the guard lands on either side of the first tail step. both keep the
// value and the short-circuit; the sidecar locks the pair
_globalThis.bareHost = { a: 1 };

export const bareRootOptionalTail = (null == _globalThis.window ? void 0 : _self.bareHost)?.a;
export const bareRootCarrierTail = (null == _globalThis.window ? void 0 : _self.bareHost.a) ?? 0;
export const callRootOptionalTail = (null == (() => _globalThis)().window ? void 0 : _self.bareHost)?.a;