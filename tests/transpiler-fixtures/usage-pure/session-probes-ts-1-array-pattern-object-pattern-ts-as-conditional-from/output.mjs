// probe corpus of the defense cycles over the destructure wrappers, family "ts", part 1:
// every block is one probed form, self-contained over the header bindings, locked on both legs
let pick = 1;
const userObj = {};
{
  const [{
    from: f
  }] = [(pick ? Array : userObj) as any];
}