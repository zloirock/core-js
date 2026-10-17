// probe corpus of the defense cycles over the destructure wrappers, family "param", part 3:
// every block is one probed form, self-contained over the header bindings, locked on both legs
let pick = 1;
const userObj = {};
{
function g([{ from: f }] = [pick ? Array : userObj]) { return f; }
}
