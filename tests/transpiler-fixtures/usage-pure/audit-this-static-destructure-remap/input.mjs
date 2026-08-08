// `const { X } = this` inside a STATIC method of `extends KnownGlobal` reads the inherited
// STATIC surface exactly like `this.X` - the destructure funnel resolves the extends host
// through the same class-walk gate as the member remap. the extraction is the plain pure
// binding (native extraction loses `this`, so the un-bound polyfill matches); rest keeps
// reading the SUBCLASS constructor verbatim; the user default is dead (polyfill defined)
class Basic extends Array {
  static m() { const { from } = this; return from; }
}
export const viaBasic = Basic.m();

class Renamed extends Map {
  static m() { const { groupBy: g } = this; return g; }
}
export const viaRenamed = Renamed.m();

class WithRest extends Array {
  static m() { const { of, ...rest } = this; return [of, rest]; }
}
export const viaRest = WithRest.m();

// a `this` PARAM-DEFAULT in a static method synths the default itself (caller-correct:
// the synth only evaluates when the arg is omitted); an unpolyfilled sibling re-reads
// through `this` - still the constructor in the default position
class ParamDefault extends Array {
  static m({ from, custom } = this) { return [from, custom]; }
}
export const viaParam = ParamDefault.m();

// a static accessor and a static field initializer are static contexts too; an assignment
// pattern routes through the same funnel; a nested class resolves against the NEAREST
// extends host, not the outer one
class Accessor extends Array {
  static get x() { const { from } = this; return from; }
}
export const viaGetter = Accessor.x;

class FieldInit extends Array {
  static p = (() => { const { of } = this; return of; })();
}
export const viaField = FieldInit.p;

let picked;
class AssignTarget extends Array {
  static m() { ({ from: picked } = this); return picked; }
}
export const viaAssign = AssignTarget.m();

class Outer extends Map {
  static o() {
    class Inner extends Array {
      static i() { const { from } = this; return from; }
    }
    return Inner.i();
  }
}
export const viaNested = Outer.o();

// SIBLING declarators in one declaration each remap independently: the split of the
// first must not derail the later `this` reads (a stale re-visit of the replaced subtree
// walks detached ancestors); the unresolved key keeps its residual read
class ThreeDecl extends Array {
  static m() {
    const { from } = this, { of } = this, { custom } = this;
    return [from, of, custom];
  }
}
export const viaThreeDecl = ThreeDecl.m();

// a for-init declarator (with a sibling) routes through the same split-safe path
class ForInit extends Array {
  static m() {
    for (let { from } = this, i = 0; i < 1; i++) { return [from, i]; }
  }
}
export const viaForInit = ForInit.m();

// a property default stays order-exact around the substituted read; an SE-key ASSIGNMENT
// keeps the source and injects the polyfill as the target default (an expression context
// cannot mint a sentinel binding, so the declarator extraction canon is unavailable)
class KeyDefault extends Array {
  static m() { const { from = 1 } = this; return from; }
}
export const viaKeyDefault = KeyDefault.m();

let counted = 0;
let seTarget;
class AssignSeKey extends Array {
  static m() { ({ [(counted++, 'of')]: seTarget } = this); return seTarget; }
}
export const viaAssignSeKey = AssignSeKey.m();

// negatives: a nested pattern HOPS through the static (the leaf is not the static surface);
// a nullish-wrapped init is not a bare `this`
class HopStatic extends Array {
  static m() { const { from: { length } } = this; return length; }
}
export const viaHop = HopStatic.m();

class Nullish extends Array {
  static m({ of } = this ?? globalThis.Array) { return of; }
}
export const viaNullish = Nullish.m();

// a computed string-literal key still counts as an own-static shadow
class ComputedShadow extends Array {
  static ['from']() { return 1; }
  static m() { const { from } = this; return from; }
}
export const viaComputedShadow = ComputedShadow.m();

// an SE computed key: the declarator canon extracts ahead and re-reads the key SE
// through a sentinel; the param-default canon synths the literal with the proven string
// key instead (an expression default cannot host the sentinel split)
let ticks = 0;
class SeKeyDecl extends Array {
  static m() { const { [(ticks++, 'of')]: o } = this; return o; }
}
export const viaSeKeyDecl = SeKeyDecl.m();

let beats = 0;
class SeKeyParam extends Array {
  static m({ [(beats++, 'from')]: f } = this) { return f; }
}
export const viaSeKeyParam = SeKeyParam.m();

// an arrow-param IIFE default routes through the same synth; a class expression is a
// static context like a declaration; a member-expression heritage resolves through the
// namespace object
class ArrowIife extends Array {
  static m() { return (({ of: viaArrow } = this) => viaArrow)(); }
}
export const viaArrowIife = ArrowIife.m();

const ClassExpr = class extends Array {
  static m() { const { from: ce } = this; return ce; }
};
export const viaClassExpr = ClassExpr.m();

const ns = { Promise };
class MemberHeritage extends ns.Promise {
  static m() { const { try: t } = this; return t; }
}
export const viaMemberHeritage = MemberHeritage.m();

// more negatives: an own static ACCESSOR shadows like a method; a rest-bearing param
// default bails (the sentinel extraction is not caller-correct without provably bare
// calls); an array pattern never reads the static surface
class AccessorShadow extends Array {
  static get of() { return 1; }
  static m() { const { of } = this; return of; }
}
export const viaAccessorShadow = AccessorShadow.m();

class RestParam extends Array {
  static m({ from, ...rest } = this) { return [from, rest]; }
}
export const viaRestParam = RestParam.m();

class ArrPattern extends Array {
  static m() { const [first] = this; return first; }
}
export const viaArrPattern = ArrPattern.m;

// a static{} block is a static context too - the destructure remap resolves through
// the same extends-host gate as static methods
class StaticBlock extends Array {
  static { const { of } = this; this.picked = of; }
}
export const viaStaticBlock = StaticBlock.picked;

// an INSTANCE-only key (`at` lives on the prototype, not the static surface) does not
// resolve as an inherited static - the destructure stays verbatim, no import
class InstanceOnlyKey extends Array {
  static m() { const { at } = this; return at; }
}
export const viaInstanceOnlyKey = InstanceOnlyKey.m();

// negatives: an own static shadows the key; an instance method's `this` is not the
// constructor; a bare class has no inherited static surface
class Shadowed extends Array {
  static from() { return 1; }
  static m() { const { from } = this; return from; }
}
export const viaShadowed = Shadowed.m();

class Instance extends Array {
  m() { const { from } = this; return from; }
}
export const viaInstance = new Instance().m();

class Bare {
  static m() { const { from } = this; return from; }
}
export const viaBare = Bare.m();
