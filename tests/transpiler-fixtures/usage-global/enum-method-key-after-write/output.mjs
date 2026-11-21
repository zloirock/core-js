import "core-js/modules/es.array.filter";
import "core-js/modules/es.array.species";
// A write to the enum member changes which array method the call needs.
enum Methods {
  Name = 'map'
}
(Methods as any).Name = 'filter';
export const selected = [1, 2, 3][Methods.Name](value => value % 2);