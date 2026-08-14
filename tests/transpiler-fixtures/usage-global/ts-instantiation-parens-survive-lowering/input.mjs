// the two halves of the compensation sit on opposite sides of every downstream lowering: the fold
// REMOVES a node they misread and runs with the emitters, the parens ADD one they cannot walk and
// go in at `post()`. these shapes are the ones that keep parens - each holds an `await` a lowering
// would have to explode, so an early paren here is what used to abort the build
declare const f: any;
declare const mk: any;
let q: any;
export async function keptFusingCast(p: Promise<unknown>) {
  return ((await p) as any)<string>;
}
export async function keptMemberTail(p: Promise<unknown>) {
  return ((await p)<string>).x;
}
export async function keptFusingUpdate() {
  return ((q++)<string>);
}
export async function keptConditionalTest(p: Promise<unknown>) {
  return ((q = await p)<string>) ? 1 : 2;
}
export const keptComputedTail = ((f)<string>)[0];
export const keptBareMemberTail = (mk<number>).nothing;
