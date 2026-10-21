// Quiet constructor defaults retain static extraction and rest handling.
// Effectful realm-key receivers keep native defaults, fallback selection and key evaluation.
let eff = 0;
function f({ from, ...rest } = globalThis[(eff++, 'self')].Array) { return [from, rest]; }
f();

function g({ of, ...rest } = globalThis[(eff++, 'self')].Array || Set) { return [of, rest]; }
g();

function m({ from, of, ...rest } = globalThis[(eff++, 'self')].Array) { return [from, of, rest]; }
m();
function n({ isArray, from: f2, ...rest } = globalThis.self.Array) { return [isArray, f2, rest]; }
n();

function p({ groupBy, ...rest } = globalThis[(eff++, 'self')].Map) { return [groupBy, rest]; }
p();

function h({ isArray, ...rest } = globalThis['self'].Array) { return [isArray, rest]; }
h();
function k({ isInteger, ...rest } = globalThis[(eff++, 'self')].Number || Set) { return [isInteger, rest]; }
k();
