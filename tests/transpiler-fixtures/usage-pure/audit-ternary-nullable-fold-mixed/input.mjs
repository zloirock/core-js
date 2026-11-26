// Either return value can reach this call.
const arr: number[] = [1];
const conflict = (c: boolean) => c ? arr : 's';
declare const flag: boolean;
// @ts-expect-error the union of string and number[] has no common includes argument
conflict(flag).includes(1);
