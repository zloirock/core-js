import "core-js/modules/es.string.repeat";
import "core-js/modules/es.number.to-fixed";
type ArrayElement<T extends readonly unknown[]> = T[number];
function first<T extends readonly unknown[]>(arr: T): ArrayElement<T> {
  return arr[0];
}
first([1, 2, 3]).toFixed(2);