// entry-global runs no usage traversal, so it mounts the instantiation-slot restoration in a pass of
// its own: an optional chain or a cast inner keeps its parens - dropped, the call joins the chain or
// the cast stops parsing - while a bare name, a member and a non-null assertion carry none and must
// stay bare
import "core-js/es/array/at";
const f: any = (x: number) => x;
const o: any = { m: f };
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const viaOptionalMember = ((o?.m)<string>)(1);
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const viaOptionalCall = ((o?.())<string>)(1);
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const viaCast = ((f as any)<string>)(1);
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const viaBare = ((f)<string>)(1);
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const viaMember = ((o.m)<string>)(1);
// @ts-expect-error an instantiation over a value with no generic signature is the shape under test
const viaNonNull = ((f!)<string>)(1);
export const r = [viaOptionalMember, viaOptionalCall, viaCast, viaBare, viaMember, viaNonNull];
