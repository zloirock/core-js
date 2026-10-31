// a type-argument list is the author's own, not an assertion about the expression being replaced,
// so a substitution that keeps the same callable keeps the arguments too. the tail lines are the
// opposite half of the same rule and matter just as much: where the rewrite leaves no trace of the
// operand the arguments applied to, carrying them over would attach them to a different function
declare const arr: number[];
export const viaStatic = ((Array.from)<number>)([1]);
export const viaCtor = new ((Map)<string, number>)();
export const viaStaticOf = ((Array.of)<number>)(1);
declare function tag<T>(s: TemplateStringsArray): T;
export const viaTaggedTag = ((tag)<string>)`t`;
export const viaPromiseStatic = ((Promise.all)<never[]>)([]);
// dropped on purpose: the instance dispatch emits a helper call over a different callable, and the
// membership test folds to a constant - in neither does the operand the arguments applied to survive
export const viaInstance = ((arr.flatMap)<number>)(x => [x]);
export const viaIn = 'from' in ((Array)<number>);
