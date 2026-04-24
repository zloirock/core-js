import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
import _globalThis from "@core-js/pure/actual/global-this";
// nested `Symbol[Symbol.asyncIterator]` as `in`-LHS - `in` rewrite bails; receiver
// Symbol and inner Symbol.asyncIterator polyfilled separately
const y = _Symbol[_Symbol$asyncIterator] in obj;
_globalThis.__y = y;