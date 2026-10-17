import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
let laterWrite;
if (typeof _Symbol != 'undefined') laterWrite = _Symbol$iterator;
export const readBeforeLiveWrite = receiver => receiver[laterWrite];
if (flag) laterWrite = 'values';