import "core-js/modules/es.array.at";
interface Record<K, V> {
  stored: number[];
}
declare const m: Record<string, number>;
export const first = m.stored.at(0);