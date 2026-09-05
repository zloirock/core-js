// a hop whose VALUE the walk cannot name but the name channel can - a call's return type, or a
// selection the other leg reads by its selecting arm - beside a sibling the pattern keeps: the leaf
// extracts off the constructor and the residual keeps the whole value, so the call runs where it ran.
// a `||` / `??` LEFT naming an object selects, a ternary needs agreeing arms (disagreeing arms
// mirror per branch); `&&` may yield its falsy left and stays whole, and so does a member nav under
// a probe
const c = 1;
const userObj = {};
const log = [];
function eff() { log.push(1); return Object; }
const { w: { keys: viaCall }, q: q1 } = { w: eff(), q: 1 };
const { w: { at: viaTwoLeaves, keys: viaTwoLeavesStatic }, q: q2 } = { w: eff(), q: 1 };
const { w: { keys: viaNullish }, q: q3 } = { w: eff() ?? Object, q: 1 };
const { w: { keys: viaNullishOther }, q: q4 } = { w: eff() ?? Array, q: 1 };
const { w: { keys: viaOr }, q: q5 } = { w: eff() || userObj, q: 1 };
const { w: { keys: viaTernary }, q: q7 } = { w: c ? eff() : Object, q: 1 };
const { w: { keys: viaTernaryUser }, q: q8 } = { w: c ? eff() : userObj, q: 1 };
const { w: { keys: viaUserLeft }, q: q9 } = { w: userObj || eff(), q: 1 };
const { w: { keys: viaSequence }, q: q10 } = { w: (log.push(2), eff()), q: 1 };
const { w: { keys: viaSole } } = { w: eff() ?? Object };
const { a: { of: viaProbe } } = { a: globalThis.window?.Array };
export {
  viaCall, q1, viaTwoLeaves, viaTwoLeavesStatic, q2, viaNullish, q3, viaNullishOther, q4, viaOr, q5,
  viaTernary, q7, viaTernaryUser, q8, viaUserLeft, q9, viaSequence, q10, viaSole, viaProbe,
};
