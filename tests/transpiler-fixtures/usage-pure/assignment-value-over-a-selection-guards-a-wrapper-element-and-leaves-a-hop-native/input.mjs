// The local truthy selector decides the Array arm. Both assignment expressions still evaluate and
// return their original RHS containers, while each `from` binding uses the Array static directly.
// `mixed-static-instance-selection` covers the live identity guard; `destructure-assignment-retains-result`
// covers an assignment pattern whose value is observed.
let pick = 1;
const userObj = {};
{
const host = ([{ from: f }] = [pick ? Array : userObj]);
}
{
const host = ({ w: { from: f } } = { w: pick ? Array : userObj });
}
