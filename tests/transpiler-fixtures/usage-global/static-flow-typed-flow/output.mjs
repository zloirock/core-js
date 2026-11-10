import "core-js/modules/es.string.repeat";
import "core-js/modules/es.string.pad-start";
import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// Type assertions do not remove reachable values or the source receiver check.
function f(c: boolean) {
  let x: string | number[] = [1];
  if (c) x = 'ab'.padStart(3) as string;else x = [2];
  return x.at(-1);
}
f(true);
f(false);
export {};