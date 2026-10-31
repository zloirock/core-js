// the second axis of the same slot: WHERE the instantiation sits. a host that keeps reading after the
// type arguments - a member tail, optional or computed, a conditional test - cannot take them, so the
// parens around the instantiation are restored
const f: any = (x: number) => x;
const g: any = (x: number) => x;
const o: any = { m: f };
let q: any;
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const hostOptionalMember = ((o)<string>)?.m;
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const hostMember = ((f || g)<string>).name;
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const hostComputedMember = ((f || g)<string>)[0];
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const hostConditionalTest = ((q = f)<string>) ? 1 : 2;
export const r = [hostOptionalMember, hostMember, hostComputedMember, hostConditionalTest, [1, [2]].flat()];
