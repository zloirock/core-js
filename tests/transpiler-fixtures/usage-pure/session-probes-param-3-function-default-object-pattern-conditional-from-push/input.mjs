// A parameter default keeps native selecting slot reads and supplied user values.
// The separate Array.from comparison and push call remain independently polyfilled.
let pick = 1;
const userObj = {};
const log = [];
{
function g({ w: { from: f } } = { w: pick ? Array : userObj }) { return f; } log.push(g() === Array.from, g({ w: userObj })());
}
