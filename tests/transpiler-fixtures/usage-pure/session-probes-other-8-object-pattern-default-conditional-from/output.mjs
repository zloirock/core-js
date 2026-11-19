// A defaulted literal slot retains its native from read from the selected constructor or user object.
let pick = 1;
const userObj = {};
{
  const {
    w: {
      from: f
    } = {}
  } = {
    w: pick ? Array : userObj
  };
}