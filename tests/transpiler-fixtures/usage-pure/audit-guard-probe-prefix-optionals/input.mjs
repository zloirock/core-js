// a SECOND unresolvable hop below the collapse (`window?.window` - the realm self-reference
// past the environment probe): the guard tests the DEEPER prefix, so the `?.` inside that test
// guards the probe itself and is LOAD-BEARING. spelling the test with the whole spine plain
// read `.window` off an absent probe - a TypeError where the source yields undefined
export const bareRootTwoHops = globalThis.window?.window?.self?.Array.of(1).at(0);
export const optionalRootTwoHops = globalThis?.window?.window?.self?.Array.of(2).at(0);
const dr = () => globalThis;
export const provenRootTwoHops = dr()?.window?.window?.self?.Array.of(3).at(0);

// the `?.` over a PROVEN root is dead text in the very same test - both emitters drop it, and
// the load-bearing one above the probe survives beside it
const sr = () => globalThis;
export const provenRootOneHop = sr()?.window?.self?.Array.of(4).at(0);

// a CHAIN-ASSIGN root under an INSTANCE dispatch: the memo binds the value the guard tests, so
// it must keep the probe hop. binding the bare write folded the hops out of the test, leaving
// an always-defined global under the null-check (the branch ran where the source short-circuits)
let held;
export const chainAssignInstance = (held = globalThis)?.window?.self?.Array.of(5).at(0);
let heldDeep;
export const chainAssignInstanceTwoHops = (heldDeep = globalThis)?.window?.window?.self?.Array.of(6).at(0);
let heldPlainHop;
export const chainAssignPlainHop = (heldPlainHop = globalThis).window?.window?.self?.Array.of(7).at(0);
export { held, heldDeep, heldPlainHop };

// the same chain-assign root with a receiver-INDEPENDENT claim (no memo): the guard shape is
// the plain probe test in both emitters, the write riding inside it
let heldStatic;
export const chainAssignStatic = (heldStatic = globalThis)?.window?.self?.Array.of(8);
export { heldStatic };

// a chain-assign root whose hops ALL resolve keeps the fold: no hop can be undefined, so the
// write is the whole kept prefix and the leaf reads off the ponyfill
let heldResolvable;
export const chainAssignResolvableHops = (heldResolvable = globalThis)?.self?.Array.of(9).at(0);
export { heldResolvable };

// NEGATIVE: a CONDITIONALLY proven callee (a single conditional assignment) proves no value -
// the unassigned path yields undefined through the call's own `?.()`, exactly what the outer
// `?.` guards, so both optionals stay live
let maybeFn;
if (globalThis.setTimeout) maybeFn = () => globalThis;
export const conditionalCalleeKeepsGuards = maybeFn?.()?.window?.self?.Array.of(10).at(0);

// NEGATIVE: an OPTIONAL call is a chain LINK, not a plain value - dropping the `?.` above it
// re-groups the chain, so the source spelling stays even though the callee is proven
const provenFn = () => globalThis;
export const optionalCallLinkKeepsGuard = provenFn?.()?.window?.self?.Array.of(11).at(0);

// NEGATIVE: an OPAQUE call root is a genuine source of undefined - its `?.` is load-bearing and
// the chain keeps the raw guarded read off the memo
const opaque = () => ({ window: { self: { Array } } });
export const opaqueRootKeepsGuard = opaque()?.window?.self?.Array.of(12).at(0);

// hops the plan does NOT cover (a non-proxy name) read off the value the render produces:
// while that value is provably defined they belong INSIDE the guarded alternate, so no `?.`
// survives for the ES5 lowering to memoize. the FIRST one pulls whatever its spelling, PLAIN
// ones keep pulling, and the first LIVE `?.` stays outside where the ternary already guards
const ut = () => globalThis;
export const unplannedOptionalTail = ut()?.window?.self?.chrome?.Array.of(13).at(0);
export const unplannedPlainTail = ut()?.window?.self.chrome.Array;
export const unplannedComputedTail = ut()?.window?.self?.['chrome'];
export const unplannedTwoTails = ut()?.window?.self?.chrome?.foo?.Array;
export const unplannedPlainChain = ut()?.window?.self?.chrome.foo.Array;

// the CALL comes along or the receiver is lost: invoked off the ternary the callee reads as a
// bare value and `this` binds to undefined where the source binds the hop. the fold TAKES the
// continuation even when it sits past the receiver span both emitters started from
export const unplannedCallTail = ut()?.window?.self?.chrome.foo(1);
export const unplannedOptionalCall = ut()?.window?.self?.chrome?.foo(2);
export const unplannedCallThenMember = ut()?.window?.self.foo().bar;
export const unplannedDeepCallChain = ut()?.window?.self.foo(1).bar.baz(2);

// NEGATIVE: `delete` needs the MEMBER itself - pulled into the alternate the ternary evaluates
// and deletes nothing, so the tail rides outside behind `?.`
export const unplannedDelete = delete ut()?.window?.self?.chrome;

// a `new` callee reads only the VALUE (no receiver binding), so it pulls like a plain tail
export function unplannedNewCallee() { return new (ut()?.window?.self?.CustomCtor)(1); }

// a pulled tail ENDS in the ternary, so an operator continuing the expression needs the parens
// (`?? 'absent'` would otherwise bind to the alternate and never see the guarded branch)
export const unplannedNullishCarrier = ut()?.window?.self?.chrome ?? 'absent';

// NEGATIVE: a SEALED read above the guard keeps the source throw - the seal ended the chain,
// so the plain read observes the short-circuited value instead of riding it
export const sealedUnplannedTail = (ut()?.window?.self).chrome;

// a planned tail of its own (`_self.window`) still folds the FIRST live `?.` above it: while
// every pulled step is a straight continuation of the leaf the alternate produces the same
// value the source reads. the SECOND guard has a step with its own `?.` behind it and stays out
export const plannedTailKeepsGuard = ut()?.window?.self?.window?.chrome?.Array;

// a render that ends in a hop of its OWN (`_self.window`) is not the ponyfill leaf, but the
// tail still folds in: the hops the render emitted are marked, so the re-traversal keeps the
// shape the plan chose instead of collapsing them against a receiver it never picked
const rt = () => globalThis;
export const renderTailPlainContinuation = rt()?.window?.self.window.chrome;
export const renderTailFirstOptionalFolds = rt()?.window?.self?.window?.chrome;
export const renderTailDeepPlain = rt()?.window?.self.window.chrome.foo;

// the same render under an INSTANCE dispatch receiver keeps its hops too (the receiver-collapse
// drive must not re-run on them)
let rc = 0;
export const renderTailInstanceRecv = (rc++, rt()?.window?.self.window).Array.prototype.indexOf.call([5], 5);
export { rc };

// an OPTIONAL call on the pulled tail keeps its `?.(` INSIDE the alternate: hung off the
// ternary the callee reads as a bare value and `this` binds to undefined where the source
// binds the member it was read from
const oc2 = () => globalThis;
export const pulledOptionalCall = oc2()?.window?.self.chrome.foo?.(1);
export const pulledOptionalCallThenMember = oc2()?.window?.self.chrome.foo?.(2).bar;
export const pulledSpreadCall = oc2()?.window?.self.chrome.foo(...[3]);
export function pulledNewCallee() { return new (oc2()?.window?.self.chrome.Ctor)(4); }

// `delete` over a pulled tail: the operand must stay a member read behind `?.` - folded into
// the alternate the ternary deletes nothing, and a tail left outside reads off the guard's
// `void 0` (a throw where the source short-circuits to a no-op `true`)
const dl = () => globalThis;
export const deleteOverPulledTail = delete dl()?.window?.self.chrome.missing;
export const deleteDirectTail = delete dl()?.window?.self.missing;
export const deleteOptionalTail = delete dl()?.window?.self?.chrome?.missing;

// the same `delete` rule on a BARE proxy root (no call around it): the operand keeps its `?.`
// whatever number of tail steps sit between the guard and the operator
globalThis.deleteNest = { key: 1 };
export const deleteBareRootDeepTail = delete globalThis.window?.self.deleteNest.key;
export const deleteBareRootDirect = delete globalThis.window?.self.deleteNest;

// a consumer that PARENTHESIZES the guard (`await`, an operator) wraps the WHOLE folded value,
// so the tail rides inside it entire - no step is stranded outside, and no `?.` the source never
// had is introduced over an intermediate the source reads plainly
const aw = () => globalThis;
export const awaitedDeepTail = async () => await aw()?.window?.self.host.probe;
export const awaitedSingleTail = async () => await aw()?.window?.self.host;
export const carrierDeepTail = aw()?.window?.self.host.probe ?? 'absent';
export const operandTail = (aw()?.window?.self.host.count ?? 0) + 1;

// assignment / update / destructure targets need the member itself, and a SEALED read keeps
// the source's own throw - the tail never folds there
globalThis.slotHost = { n: 1 };
export function assignThroughGuard() { (aw()?.window?.self).slotHost.n = 10; }
export function updateThroughGuard() { (aw()?.window?.self).slotHost.n++; }
export function destructureThroughGuard() { [(aw()?.window?.self).slotHost.n] = [7]; }

// consumer contexts around the guard: a ternary TEST and an operator parenthesize it, while a
// class field / sequence / for-of element do not - either way the tail rides inside
globalThis.consumerHost = { n: 1, list: [1] };
const cs = () => globalThis;
export const ternaryTestConsumer = cs()?.window?.self.consumerHost.n ? 'y' : 'n';
export const whileConsumer = () => { while (cs()?.window?.self.consumerHost.n > 100) break; };
export const sequenceConsumer = (0, cs()?.window?.self.consumerHost.n);
class ConsumerHost {
  static field = cs()?.window?.self.consumerHost.n;
  inst = cs()?.window?.self.consumerHost.list.at(0);
}
export const consumerHost = ConsumerHost;

// PARENS between the callee and its call end the chain: the source throws on a nullish value
// there, so the call never joins the alternate (folding it would swallow that throw and hand
// the callee a receiver the source does not give it)
globalThis.parenHost = { fn(x) { return x; }, Ctor: Map };
const pc = () => globalThis;
export const parenCalleeStaysOutside = (pc()?.window?.self.parenHost.fn)(2);
export const parenCalleeSealed = ((pc()?.window?.self).parenHost.fn)(3);
export function newOverPulledTail() { return new (pc()?.window?.self.parenHost.Ctor)(); }

// a TAGGED template reads its tag as a REFERENCE (`(w?.self.tag)`x`` binds `this`), so the tail
// stays outside - but behind a `?.`, and inside the source's own parens. read PLAIN it throws on
// the very branch the guard proved absent, before the template's substitutions ever run, while
// the source short-circuits the whole tag and throws only at the call
globalThis.tagHost = { tag(strings) { return strings[0]; } };
const tg = () => globalThis;
export const taggedTemplateTail = (tg()?.window?.self.tagHost.tag)`x`;

// a migrated hop-key SE wraps the BINDING only - the tail reads off its value, so the sequence
// parens close before it (`(se, _self).tail`). a SE-keyed hop IN the tail keeps its own span
let seK = 0;
globalThis.seKeyHost = { w: { c: 1 } };
const sk2 = () => globalThis;
export const seKeyThenPlainTail = sk2()?.window?.[(seK++, 'self')].seKeyHost.w.c;
export const seKeyDeleteTail = delete sk2()?.window?.[(seK++, 'self')].seKeyHost.w.c;
export { seK };

// an OPAQUE computed key carries its own effects and migration canon: the fold stops there in
// both emitters, so the key keeps its single evaluation on the guarded branch
let ck2 = 0;
globalThis.ckHost = { a: 1 };
const ckr = () => globalThis;
export const opaqueComputedKeyTail = ckr()?.window?.[(ck2++, 'self')]?.window?.[(ck2++, 'ckHost')]?.a;
export const opaqueComputedKeyPlain = ckr()?.window?.self[(ck2++, 'ckHost')].a;
export { ck2 };

// a PLAIN step followed by a live `?.`: while every step so far was plain the folded value is a
// straight continuation of the leaf, so that first `?.` still rides INSIDE the alternate
const pf = () => globalThis;
export const plainThenLiveOptional = pf()?.window?.self.chrome?.foo.bar;

// an opaque computed key with no EFFECTS folds like any other step - only a key carrying its
// own effects keeps its migration canon (and its own span) outside the fold
globalThis.metaHost = { a: 1, b: 2 };
const mt = () => globalThis;
export const opaqueKeyNoEffects = mt()?.window?.self.metaHost[globalThis.flag ? 'a' : 'b'];
export const opaqueKeyRuntimeValue = mt()?.window?.self.metaHost[String('a')];

// BARE proxy root (no call around it) with an optional tail: the two emitters pick different
// channels for it, so the guard lands on either side of the first tail step. both keep the
// value and the short-circuit; the sidecar locks the pair
globalThis.bareHost = { a: 1 };
export const bareRootOptionalTail = globalThis.window?.self?.bareHost?.a;
export const bareRootCarrierTail = globalThis.window?.self.bareHost.a ?? 0;
export const callRootOptionalTail = (() => globalThis)()?.window?.self?.bareHost?.a;
