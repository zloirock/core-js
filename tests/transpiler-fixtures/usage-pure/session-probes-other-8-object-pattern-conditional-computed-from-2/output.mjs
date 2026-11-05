// A computed sibling can affect literal-container resolution, so the selected from pattern stays native.
let pick = 1;
const userObj = {};
const k = 'k';
{
  const {
    w: {
      from: f
    }
  } = {
    w: pick ? Array : userObj,
    [k]: 1
  };
}