import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// Each optional boundary survives capturing the selected realm and constructor.
export function read(choice) {
  return (choice ? globalThis : null)?.Array?.from([3]);
}