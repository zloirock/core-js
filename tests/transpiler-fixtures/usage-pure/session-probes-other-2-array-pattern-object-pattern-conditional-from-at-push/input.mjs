// The first element selects Array, so its extracted from and the later Array.from read must agree.
let pick = 1;
const userObj = {};
const arr = [1, 2];
const log = [];
{
// Bind from before extracting at from the second element.
const [{ from: f }, { at: a }] = [pick ? Array : userObj, arr]; log.push(f === Array.from, typeof a);
}
