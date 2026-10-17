// probe corpus of the defense cycles over the destructure wrappers, family "other", part 1:
// every block is one probed form, self-contained over the header bindings, locked on both legs
let pick = 1;
function eff() { return Object; }
{
const [, { from: f }] = [eff(), pick && Array];
}
