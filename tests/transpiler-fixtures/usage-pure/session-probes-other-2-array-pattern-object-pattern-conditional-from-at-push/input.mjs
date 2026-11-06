// An instance capture in the second element preserves the first element's native conditional from read.
// The separate Array.from comparison remains polyfilled.
let pick = 1;
const userObj = {};
const arr = [1, 2];
const log = [];
{
// The native first slot reads before the second slot's instance extraction.
const [{ from: f }, { at: a }] = [pick ? Array : userObj, arr]; log.push(f === Array.from, typeof a);
}
