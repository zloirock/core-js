// methods-only: the union folds to Function, which has no instance helpers at all
interface Fns {
  a(): number;
  b(): string;
}
declare const f: Fns[keyof Fns];
// @ts-expect-error the member read is the probe, and the right answer is a type without it
export const r5 = f.at(2);