// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Supplied values and defaults keep their source branches and independent claims.
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