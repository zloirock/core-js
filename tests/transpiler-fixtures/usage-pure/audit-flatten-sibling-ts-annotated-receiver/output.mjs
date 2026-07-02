import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A flatten-shared destructure sibling in a TypeScript source: the TS-annotated preceding binding
// engages the typescript parser, exercising the flatten + sibling emit on the TS parse path
const arr: number[] = getArr();
const from = _Array$from;
const at = _atMaybeArray(arr);
from([1]);
at(0);