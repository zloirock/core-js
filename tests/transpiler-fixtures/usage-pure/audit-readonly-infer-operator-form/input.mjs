// `readonly (infer U)[]` operator form is a READONLY pattern like `ReadonlyArray<infer U>`:
// a readonly check binds U (TRUE branch) - peeling the modifier without remembering it
// fired the readonly-vs-mutable rejection and took the FALSE branch (wrong-family Maybe
// on the runtime string, ie:11)
type UnwrapOp<T> = T extends readonly (infer U)[] ? U : number[];
declare const viaOperandInput: UnwrapOp<ReadonlyArray<string>>;
export const viaOperator = viaOperandInput.at(0);

// reference form control - same conditional through `ReadonlyArray<infer U>`
type UnwrapRef<T> = T extends ReadonlyArray<infer U> ? U : number[];
declare const viaRefInput: UnwrapRef<ReadonlyArray<string>>;
export const viaReference = viaRefInput.includes('a');

// a MUTABLE `Array<infer U>` pattern still rejects a readonly check (FALSE branch)
type UnwrapMut<T> = T extends Array<infer U> ? U : number[];
declare const viaMutInput: UnwrapMut<ReadonlyArray<string>>;
export const viaMutablePattern = viaMutInput.at(0);
