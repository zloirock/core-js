import _Array$from from "@core-js/pure/actual/array/from";
import _at from "@core-js/pure/actual/instance/at";
// A for-init flatten declaration whose sibling extracts an instance method: the for-init header is a
// single comma-list, so the flatten binding and the sibling's rewrite stay comma-joined in place
for (const from = _Array$from, at = _at(getArr()); from([1]) && at([2]);) break;