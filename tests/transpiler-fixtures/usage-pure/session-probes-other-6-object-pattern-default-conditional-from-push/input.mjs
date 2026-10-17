// probe corpus of the defense cycles over the destructure wrappers, family "other", part 6:
// every block is one probed form, self-contained over the header bindings, locked on both legs
let pick = 1;
const userObj = {};
const log = [];
function eff() { return Object; }
{
const { a: eff1 = eff(), w: { from: f } } = { a: undefined, w: pick ? Array : userObj }; log.push(f === Array.from, eff1);
}
