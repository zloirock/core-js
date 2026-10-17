// probe corpus of the defense cycles over the destructure wrappers, family "other", part 4:
// every block is one probed form, self-contained over the header bindings, locked on both legs
let pick = 1;
const userObj = {};
{
const { 0: { from: f } } = [pick ? Array : userObj];
}
