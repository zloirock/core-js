// A static-only conditional array assignment retains its native from read and chosen element.
let pick = 1;
const userObj = {};
{
  let f;
  [{
    from: f
  }] = [pick ? Array : userObj];
}