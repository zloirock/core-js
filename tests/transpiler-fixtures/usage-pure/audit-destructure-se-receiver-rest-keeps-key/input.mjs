// regression lock: a destructured static with a `...rest` sibling and a side-effecting receiver
// (`const { from, ...rest } = (eff(), Array)`) keeps the consumed key as a `from: <throwaway>`
// sentinel so rest exclusion survives - rest must NOT capture `from` - and the receiver SE runs once
let log = [];
const { from, ...rest } = (log.push(1), Array);
from([1]);
export { rest, log };
