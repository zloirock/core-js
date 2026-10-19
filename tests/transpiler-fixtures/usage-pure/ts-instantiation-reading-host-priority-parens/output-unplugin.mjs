// the second axis of the same slot: WHERE the instantiation sits, with a polyfilled static under it
// so the ponyfill substitution and the host decision meet. a host that keeps reading after the type
// arguments - a member tail, a computed member, a conditional test - cannot take them, so the
// instantiation keeps its parens
import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";

const g: any = (x: number) => x;
let q: any;

// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const hostMember = _nameMaybeFunction((g || _Array$from)<any>);

// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const hostComputedMember = ((g || _Array$of)<any>)[0];

const hostConditionalTest = (q = _Promise$allSettled)<any> ? 1 : 2;

export const r = [hostMember, hostComputedMember, hostConditionalTest];