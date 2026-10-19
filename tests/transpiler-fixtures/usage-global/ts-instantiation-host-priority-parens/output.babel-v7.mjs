import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
// the second axis of the same slot: WHERE the instantiation sits. a host that can carry the type
// arguments itself - a call, `new` with or without arguments, an optional call, a tagged tag - takes
// them and the node folds away
const f: any = (x: number) => x;
const g: any = (x: number) => x;
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const hostCall = (f || g)<string>(1);
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const hostNew = new (f || g)<string>();
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const hostOptionalCall = (f || g)<string>?.(1);
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const hostTaggedTag = (f || g)<string>`t`;
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const hostNewBareArgs = new (f || g)<string>();
export const r = [hostCall, hostNew, hostNewBareArgs, hostOptionalCall, hostTaggedTag, [1, [2]].flat()];