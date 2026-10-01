import "core-js/modules/es.number.constructor";
import "core-js/modules/es.string.raw";
// Cross assignments capture the source at each write, even though the alias graph cycles.
// Both names still hold the second container, so raw selects the String static.
let first = {
  x: Number
};
let second = {
  x: String
};
first = second;
second = first;
const {
  x: {
    raw
  }
} = first;