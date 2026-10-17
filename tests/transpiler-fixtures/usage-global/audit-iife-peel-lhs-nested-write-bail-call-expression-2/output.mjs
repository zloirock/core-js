import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
const sink = {};
const viaMemberKey = (arg => {
  sink[arg = Promise] = 1;
  return arg;
})(Array);
const {
  of
} = viaMemberKey;
export const r2 = of(3);