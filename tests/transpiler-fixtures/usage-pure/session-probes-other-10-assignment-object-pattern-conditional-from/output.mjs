// A selecting value inside a literal-object assignment retains its native from read.
let pick = 1;
const userObj = {};
{
  let f;
  ({
    w: {
      from: f
    }
  } = {
    w: pick ? Array : userObj
  });
}