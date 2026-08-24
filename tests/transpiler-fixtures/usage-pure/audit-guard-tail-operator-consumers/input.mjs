// a folded guard tail ends in a bare ternary, the loosest expression there is: an OPERAND slot
// on either side of an operator swallows it, so the fold owes that consumer its parens. both
// emitters read the consumer off the AST for exactly this reason - approximating it from the
// source text mistook every operator sharing a character with something else (`===` for an
// assignment, `>=` for an arrow) and returned the operand instead of the comparison
export const eqRight = 1 === globalThis.window?.self.Array.of(1).at(0);
export const neqRight = 1 !== globalThis.window?.self.Object.assign({}, { a: 1 }).a;
export const gtRight = 2 > globalThis.window?.self.Math.trunc(1.5);
export const geRight = 2 >= globalThis.window?.self.Number.parseFloat('1.5');
export const leRight = 1 <= globalThis.window?.self.Reflect.ownKeys({ a: 1 }).length;
export const shiftRight = 4 >> globalThis.window?.self.Array.from([1]).length;

// the same slots over a CALL root, whose guard test carries the root effect. a claim's MEMBER
// tail grows through the same shared walk an invoked one does - spelling it by a rule of its own
// folded a different number of steps than babel for the same source
const cr = () => globalThis;
export const eqRightCall = 1 === cr().window?.self.Set.prototype.constructor.length;
export const gtRightCall = 2 > cr().window?.self.Math.fround(1.5);

// the guard on the LEFT of an operator is an operand too: the folded tail may not end the
// expression there either
export const eqLeft = globalThis.window?.self.Promise.resolve(1).constructor.length === 1;
export const shiftLeft = globalThis.window?.self.Number.parseInt('4', 10) >> 1;

// slots that already delimit a whole expression keep the ternary BARE. `=` opens one only as a
// (compound) assignment, `>` only as an arrow - the negatives that pin the pair classification
let assigned;
assigned = globalThis.window?.self.Symbol.for('x').description;
let compound = 10;
compound -= globalThis.window?.self.Math.cbrt(8);
let logical = 0;
logical ||= globalThis.window?.self.Number.MAX_SAFE_INTEGER;
const arrowBody = () => globalThis.window?.self.Object.entries({ a: 1 }).length;
function returned() {
  return globalThis.window?.self.Array.of(2).keys();
}
export { assigned, compound, logical };
export const arrowValue = arrowBody();
export const returnedValue = returned().next().value;

// an `extends` clause parenthesizes the fold too - it takes a LeftHandSideExpression - so the
// tail rides inside those parens exactly as under an operator. listing that consumer on one
// emitter only spelled the same fold two ways
const host = globalThis.window?.self;
class Extended extends globalThis.window?.self.hostBox.Base {}
export const extendedName = Extended.name;
export const negated = -globalThis.window?.self.hostBox.count;
export const spreadTail = [...globalThis.window?.self.Array.of(1, 2).values()];
export { host };

// a ternary CONSEQUENT delimits a whole expression, so the fold stays BARE there; the right
// operand of `??` looks the same from the source and does NOT - the pair pins which slot the
// consumer actually is
export const ternaryConsequent = 1 ? globalThis.window?.self.Math.sign(-2) : 0;
export const ternaryAlternate = 0 ? 9 : globalThis.window?.self.Math.expm1(0);
const seed = null;
export const nullishRight = seed ?? globalThis.window?.self.Number.EPSILON;

// a for-of / for-in head holds a whole expression up to its `)`, and a case arm's assignment
// runs to the `break` - the fold stays bare in all three
export const spread = [];
for (const item of globalThis.window?.self.Array.of(3, 4)) spread.push(item);
export const keys = [];
for (const key in globalThis.window?.self.Object.fromEntries([['a', 1]])) keys.push(key);
let switched = 0;
switch (1) {
  case 1: switched = globalThis.window?.self.Math.hypot(3, 4); break;
  default: break;
}
export { switched };
