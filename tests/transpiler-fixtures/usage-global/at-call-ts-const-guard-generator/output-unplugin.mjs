import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.string.at";
declare const x: string | number[];
if (typeof x === "string") {
  const gen = function*() { yield x.at(-1); };
}