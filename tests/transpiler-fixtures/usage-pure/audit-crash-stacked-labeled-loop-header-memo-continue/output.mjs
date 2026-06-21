import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// STACKED labeled loop (`lab1: lab2: for(...)`) whose header needs a `_ref` memo and whose body
// is `continue <outerLabel>`: both labels must stay on the loop. walking up must peel ALL stacked
// labels to reach the loop, else the memo block lands between the outer label and the loop, making
// `continue lab1` an illegal continue (V8 rejects it; the oxc runner does not). regression lock
lab1: lab2: for (let i = 0; _atMaybeArray(_ref = [1]).call(_ref, i) >= 0; i++) continue lab1;