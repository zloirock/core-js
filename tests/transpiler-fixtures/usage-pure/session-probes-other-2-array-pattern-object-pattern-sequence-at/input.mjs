// probe corpus of the defense cycles over the destructure wrappers, family "other", part 2:
// every block is one probed form, self-contained over the header bindings, locked on both legs
let pick = 1;
const userObj = {};
const arr = [1, 2];
const log = [];
function mark(t, v) { log.push(t); return v; }
{
const [{ from: f }] = [(mark++, pick ? Array : userObj)];
}
{
const [{ from: f }] = [pick ? (mark++, Array) : userObj];
}
{
const [{ w: { at: m } }] = [{ w: (mark(), arr) }]; use(m);
}
