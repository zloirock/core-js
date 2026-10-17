// probe corpus of the defense cycles over the destructure wrappers, family "param", part 3:
// every block is one probed form, self-contained over the header bindings, locked on both legs
let pick = 1;
const userObj = {};
const log = [];
{
function g({ w: { from: f } } = { w: pick ? Array : userObj }) { return f; } log.push(g() === Array.from, g({ w: userObj })());
}
