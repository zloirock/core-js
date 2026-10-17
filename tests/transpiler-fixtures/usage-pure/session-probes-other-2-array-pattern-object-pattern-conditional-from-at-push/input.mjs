// probe corpus of the defense cycles over the destructure wrappers, family "other", part 2:
// every block is one probed form, self-contained over the header bindings, locked on both legs
let pick = 1;
const userObj = {};
const arr = [1, 2];
const log = [];
{
// The native first slot reads before the second slot's instance extraction.
const [{ from: f }, { at: a }] = [pick ? Array : userObj, arr]; log.push(f === Array.from, typeof a);
}
