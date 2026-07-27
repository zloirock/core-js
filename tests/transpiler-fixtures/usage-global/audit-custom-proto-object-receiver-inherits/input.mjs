// an object whose prototype is not `Object.prototype` INHERITS that prototype's methods, so the
// member read needs the polyfill on an engine lacking it. every channel that installs one is
// recognised - the literal's own `__proto__:` property, a later `__proto__` write, and a
// `setPrototypeOf` call - and the reference is matched through transparent wrappers and a sequence
// VALUE position, since the install still lands on it there. the object itself stays untyped, but
// the installed prototype NAMES the family it dispatches: an object inheriting `Array.prototype` can
// reach the array variants and no others, so those are the only ones injected. the family comes from
// the general type resolution, so an INSTANCE names it just as a prototype object does - inheriting a
// regexp reaches the regexp chain, which carries no `includes` at all, and nothing is injected. only
// a prototype value the resolver cannot type keeps every variant. the boundaries keep their old
// verdicts: `__proto__: null` installs no dispatcher, a computed-key `__proto__` property is an
// ordinary own property (only the NON-computed key spelling sets a prototype, while a computed
// MEMBER WRITE does go through the setter), a binding in the PROTO slot is a source rather than a
// sequence whose VALUE is a different binding never reaches the call. the CALLEE is resolved, not
// name-matched: a same-named method on any other object installs nothing, and a shadowed `Object`
// is not the global. `Object.create` follows the same rule as the literal: a `null` prototype
// dispatches nothing, any other argument installs a prototype the resolver does not follow. only an
// OBJECT can install a dispatcher, so a primitive prototype value is inert in every channel - the
// `__proto__` spellings are no-ops there and `setPrototypeOf` / `Object.create` throw. `void <expr>`
// evaluates to undefined whatever its operand, so it is inert the same way.
// distinct method per line
let literal = { __proto__: Array.prototype };
export const a = literal.at(-1);
let written = {};
written.__proto__ = Array.prototype;
export const b = written.flatMap(f);
let viaCall = {};
Object.setPrototypeOf(viaCall, Array.prototype);
export const c = viaCall.findLast(f);
let behindSequence = {};
Object.setPrototypeOf((eff(), behindSequence), Array.prototype);
export const d = behindSequence.toSorted();
let stringKey = { "__proto__": Array.prototype };
export const m = stringKey.flat();
let computedWrite = {};
computedWrite["__proto__"] = Array.prototype;
export const n = computedWrite.findLastIndex(f);
let nullProto = { __proto__: null };
export const e = nullProto.padStart(3);
let ownProp = { ["__proto__"]: Array.prototype };
export const g = ownProp.trimStart();
let protoSource = {};
Object.setPrototypeOf(other, protoSource);
export const h = protoSource.padEnd(3);
let notTheValue = {};
Object.setPrototypeOf((notTheValue, unrelated), Array.prototype);
export const i = notTheValue.trimEnd();
let foreignSetter = {};
myLib.setPrototypeOf(foreignSetter, Array.prototype);
export const j = foreignSetter.toReversed();
let shadowedGlobal = {};
{
  const Object = myLib;
  Object.setPrototypeOf(shadowedGlobal, Array.prototype);
}
export const k = shadowedGlobal.with(0, 1);
let createdNull = Object.create(null);
export const o1 = createdNull.copyWithin(0);
let createdProto = Object.create(Array.prototype);
export const o2 = createdProto.fill(0);
let shadowedCreate = myLib.create(null);
export const o3 = shadowedCreate.toSpliced(0);
let primitiveProto = { __proto__: 42 };
export const p1 = primitiveProto.entries();
let undefinedProto = {};
undefinedProto.__proto__ = undefined;
export const p2 = undefinedProto.values();
let regexpProto = { __proto__: /re/ };
export const p3 = regexpProto.includes(1);
let voidProto = { __proto__: void 0 };
export const v1 = voidProto.lastIndexOf(x);
let voidWrite = {};
voidWrite.__proto__ = void f();
export const v2 = voidWrite.toLocaleString();
let unresolvedProto = { __proto__: mystery };
export const u = unresolvedProto.keys();
