import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.function.name";
// the second axis of the same slot: WHERE the instantiation sits. a host that can carry the type
// arguments itself (call, new, optional call, tagged tag) takes them and the node folds away; a host
// that keeps reading after them (member tail, conditional test) needs the parens restored; every
// other host terminates the expression, and there only a shape fusing on its own token still owes
const f: any = (x: number) => x;
const g: any = (x: number) => x;
const o: any = {
  m: f
};
let q: any;
const hostCall = (f || g)<string>(1);
const hostNew = new (f || g)<string>();
const hostOptionalCall = (f || g)?.<string>(1);
const hostTaggedTag = (f || g)<string>`t`;
const hostNewBareArgs = new (f || g)<string>();
const hostOptionalMember = (o<string>)?.m;
const hostMember = ((f || g)<string>).name;
const hostComputedMember = ((f || g)<string>)[0];
const hostConditionalTest = (q = f)<string> ? 1 : 2;
// hosts that end the expression: a loose-but-not-fusing shape keeps no parens, a fusing one does -
// parens are spelled as a node later lowerings must accept, so they are only added where owed
const tailValue = f || g<string>;
const tailArgument = g(f || g<string>);
const tailElement = [f || g<string>];
const tailFusingCast = (f as any)<string>;
const tailFusingAssertion = (<any> f)<string>;
const tailFusingUpdate = (q++)<string>;
export const r = [hostCall, hostNew, hostNewBareArgs, hostOptionalMember, hostOptionalCall, hostTaggedTag, hostMember, hostComputedMember, hostConditionalTest, tailValue, tailArgument, tailElement, tailFusingCast, tailFusingAssertion, tailFusingUpdate, [1, [2]].flat()];