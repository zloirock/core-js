import _Array$from from "@core-js/pure/actual/array/from";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise$all from "@core-js/pure/actual/promise/all";
// a type-argument list is the author's own, not an assertion about the expression being replaced,
// so a substitution that keeps the same callable keeps the arguments too. the tail lines are the
// opposite half of the same rule and matter just as much: where the rewrite leaves no trace of the
// operand the arguments applied to, carrying them over would attach them to a different function
declare const arr: number[];
export const viaStatic = (_Array$from<number>)([1]);
export const viaCtor = new (_Map<string, number>)();
export const viaStaticOf = (_Array$of<number>)(1);
declare function tag<T>(s: TemplateStringsArray): T;
export const viaTaggedTag = ((tag)<string>)`t`;
export const viaPromiseStatic = (_Promise$all<never[]>)([]);
// dropped on purpose: the instance dispatch emits a helper call over a different callable, and the
// membership test folds to a constant - in neither does the operand the arguments applied to survive
export const viaInstance = _flatMapMaybeArray(arr).call(arr, x => [x]);
export const viaIn = true;