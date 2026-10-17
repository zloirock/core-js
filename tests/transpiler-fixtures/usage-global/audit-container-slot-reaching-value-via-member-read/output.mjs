import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// the member-read spelling reaches the same written value
const cm = {
  s: Object
};
cm.s = Array;
export const viaMemberRead = cm.s.from([1]);