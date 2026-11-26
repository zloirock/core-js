import _includes from "@core-js/pure/actual/instance/includes";
var _ref;
// Either return value can reach this call.
const arr: number[] = [1];
const conflict = (c: boolean) => c ? arr : 's';
declare const flag: boolean;
// @ts-expect-error the union of string and number[] has no common includes argument
_includes(_ref = conflict(flag)).call(_ref, 1);