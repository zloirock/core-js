// probe corpus of the defense cycles over the destructure wrappers, family "other", part 1:
// every block is one probed form, self-contained over the header bindings, locked on both legs
let pick = 1;
const userObj = {};
const log = [];
{
class C1 { constructor([{ from: f }] = [pick ? Array : userObj]) { this.f = f; } } log.push(new C1().f === Array.from, new C1([userObj]).f());
}
