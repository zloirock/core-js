// probe corpus of the defense cycles over the destructure wrappers, family "other", part 1:
// every block is one probed form, self-contained over the header bindings, locked on both legs
let pick = 1;
const userObj = {};
const arr = [1, 2];
const log = [];
{
const [{ at: a }, { from: f }] = [arr, pick ? Array : userObj]; log.push(f === Array.from, typeof a);
}
