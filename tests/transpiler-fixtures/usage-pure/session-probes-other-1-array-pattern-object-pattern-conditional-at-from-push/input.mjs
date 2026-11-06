// An instance capture in the first array element retains the supported conditional static neighbour.
// The selected from and later comparison use the same static import.
let pick = 1;
const userObj = {};
const arr = [1, 2];
const log = [];
{
const [{ at: a }, { from: f }] = [arr, pick ? Array : userObj]; log.push(f === Array.from, typeof a);
}
