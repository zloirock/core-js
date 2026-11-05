// A getter returning a conditional value remains the source of the native from read.
let pick = 1;
const userObj = {};
{
  const {
    w: {
      from: f
    }
  } = {
    get w() {
      return pick ? Array : userObj;
    }
  };
}