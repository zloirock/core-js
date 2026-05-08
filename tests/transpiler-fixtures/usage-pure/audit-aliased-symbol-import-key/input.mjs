// user imports well-known Symbols from core-js/pure directly. the `in` check must
// recognise the imported binding as a well-known Symbol and skip emitting a separate
// Symbol polyfill, on both pipelines, regardless of how each detects the source
import iter from "@core-js/pure/actual/symbol/iterator";
import async from "@core-js/pure/actual/symbol/async-iterator";
const isIter = iter in target;
const isAsync = async in target;
target.find(x => x);
