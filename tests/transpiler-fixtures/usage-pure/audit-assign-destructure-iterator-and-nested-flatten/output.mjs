import _Array$from from "@core-js/pure/actual/array/from";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
it = _getIteratorMethod(_globalThis); // an assignment-destructure mixing a standalone-emit prop (`[Symbol.iterator]`) BEFORE a
// nested-flatten prop (`Array: { from }`) must not queue two whole-statement overwrites; the
// standalone sibling defers to the cascade instead of self-registering a colliding overwrite
from = _Array$from;
use(it);
from(x);