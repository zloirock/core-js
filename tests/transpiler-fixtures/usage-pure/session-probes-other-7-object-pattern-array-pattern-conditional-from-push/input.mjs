// probe corpus of the defense cycles over the destructure wrappers, family "other", part 7:
// every block is one probed form, self-contained over the header bindings, locked on both legs
let pick = 1;
const userObj = {};
const log = [];
{
const { w: [{ from: f }] } = { w: [pick ? Array : userObj] }; log.push(f === Array.from);
}
