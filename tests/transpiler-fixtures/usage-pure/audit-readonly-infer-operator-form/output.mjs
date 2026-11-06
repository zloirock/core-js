import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// `readonly (infer U)[]` operator form is a READONLY pattern like `ReadonlyArray<infer U>`:
// a readonly check binds U (TRUE branch) - peeling the modifier without remembering it
// fired the readonly-vs-mutable rejection and took the FALSE branch (wrong-family Maybe
// on the runtime string, ie:11)
type UnwrapOp<T> = T extends readonly (infer U)[] ? U : number[];
declare const viaOperandInput: UnwrapOp<ReadonlyArray<string>>;
export const viaOperator = _atMaybeString(viaOperandInput).call(viaOperandInput, 0);

// reference form control - same conditional through `ReadonlyArray<infer U>`
type UnwrapRef<T> = T extends ReadonlyArray<infer U> ? U : number[];
declare const viaRefInput: UnwrapRef<ReadonlyArray<string>>;
export const viaReference = _includesMaybeString(viaRefInput).call(viaRefInput, 'a');

// a MUTABLE `Array<infer U>` pattern still rejects a readonly check (FALSE branch)
type UnwrapMut<T> = T extends Array<infer U> ? U : number[];
declare const viaMutInput: UnwrapMut<ReadonlyArray<string>>;
export const viaMutablePattern = _atMaybeArray(viaMutInput).call(viaMutInput, 0);