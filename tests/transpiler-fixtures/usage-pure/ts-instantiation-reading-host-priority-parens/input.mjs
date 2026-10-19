// the second axis of the same slot: WHERE the instantiation sits, with a polyfilled static under it
// so the ponyfill substitution and the host decision meet. a host that keeps reading after the type
// arguments - a member tail, a computed member, a conditional test - cannot take them, so the
// instantiation keeps its parens
const g: any = (x: number) => x;
let q: any;
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const hostMember = ((g || Array.from)<any>).name;
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const hostComputedMember = ((g || Array.of)<any>)[0];
const hostConditionalTest = ((q = Promise.allSettled)<any>) ? 1 : 2;
export const r = [hostMember, hostComputedMember, hostConditionalTest];
