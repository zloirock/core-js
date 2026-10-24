// reassigned wrapper bails resolution: `let wrapper` plus a later write violates the
// const-binding assumption. follow-init walker detects `constantViolations` and stops
// chasing the chain, preventing a stale `[Array]` snapshot from driving the extraction
let wrapper = [Array];
wrapper = [];
const [{ from }] = wrapper;
from && from([1]);
