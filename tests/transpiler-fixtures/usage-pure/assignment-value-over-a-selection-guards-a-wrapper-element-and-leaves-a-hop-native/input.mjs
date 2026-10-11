// an assignment whose value is read, over a selection of a constructor and a user object: the static off an
// array wrapper's element takes the identity guard over the captured element, while the same static off an
// object hop's slot stays native, unserved on an engine that lacks it
let pick = 1;
const userObj = {};
{
const host = ([{ from: f }] = [pick ? Array : userObj]);
}
{
const host = ({ w: { from: f } } = { w: pick ? Array : userObj });
}
