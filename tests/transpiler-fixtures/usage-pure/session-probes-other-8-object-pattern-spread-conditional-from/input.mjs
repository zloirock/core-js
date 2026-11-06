// Object spreading completes before the explicit selecting slot is read by the native pattern.
let pick = 1;
const userObj = {};
const more = {};
{
const { w: { from: f } } = { ...more, w: pick ? Array : userObj };
}
