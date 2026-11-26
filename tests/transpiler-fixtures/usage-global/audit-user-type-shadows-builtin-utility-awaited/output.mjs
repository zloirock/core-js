import "core-js/modules/es.array.at";
interface Partial<T> {
  held: number[];
}
declare const awaited: Awaited<Partial<string>>;
export const peeled = awaited.held.at(0);