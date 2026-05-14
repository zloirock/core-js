import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `Awaited<Promise<string[]> | null>` distributes the await over each union member.
// the null member contributes nothing to subsequent member-dispatch  -  only the array
// branch carries `.at`, dispatch should still narrow without bailing on the null member
declare function probe(): Promise<string[]> | null;
const r = await probe()!;
_atMaybeArray(r).call(r, 0);