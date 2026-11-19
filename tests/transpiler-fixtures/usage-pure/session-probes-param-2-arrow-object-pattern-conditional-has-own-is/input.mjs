// A selected object slot keeps its static claim independently of its literal sibling.
const c = 1;
const userObj = {};
{
const r = (({ a: { hasOwn }, b: { is } }) => [hasOwn, is])({ a: c ? Object : userObj, b: Object });
}
