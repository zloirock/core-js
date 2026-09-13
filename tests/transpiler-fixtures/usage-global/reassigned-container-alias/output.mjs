import "core-js/modules/es.number.constructor";
import "core-js/modules/es.string.raw";
// A dominating assignment from another local holder selects its slot value.
// Neither local container escapes; reading raw needs only the String static.
let first = {
  x: Number
};
let second = {
  x: String
};
first = second;
const {
  x: {
    raw
  }
} = first;