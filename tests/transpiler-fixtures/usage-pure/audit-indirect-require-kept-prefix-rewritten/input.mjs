// Calls in each require prefix need their own ponyfill, including the literal receivers.
// Each user-written module load must follow that prefix.
let arr = [1];
(arr.at(0), require)("core-js/modules/es.array.includes");
([1].at(0), require)("core-js/modules/es.array.from");
(0, ([2].at(1), require))("core-js/modules/es.array.of");
export const r = arr;
