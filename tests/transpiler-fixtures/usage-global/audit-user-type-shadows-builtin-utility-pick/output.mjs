import "core-js/modules/es.array.includes";
interface Pick<T> {
  picked: number[];
}
declare const p: Pick<string>;
export const found = p.picked.includes(1);