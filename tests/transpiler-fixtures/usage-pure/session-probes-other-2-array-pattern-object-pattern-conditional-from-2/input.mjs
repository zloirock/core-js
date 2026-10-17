// probe corpus of the defense cycles over the destructure wrappers, family "other", part 2:
// every block is one probed form, self-contained over the header bindings, locked on both legs
let pick = 1;
const userObj = {};
function eff() { return Object; }
{
const [{ from: f }, z] = [pick ? Array : userObj, eff()];
}
