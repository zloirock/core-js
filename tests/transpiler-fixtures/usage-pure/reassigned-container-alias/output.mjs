import _String$raw from "@core-js/pure/actual/string/raw";
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
} = {
  x: {
    raw: _String$raw
  }
};