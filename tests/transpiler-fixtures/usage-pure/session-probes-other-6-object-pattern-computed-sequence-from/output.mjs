// An effectful literal-container hop keeps its native static read without dropping the key call.
function eff() {
  return Object;
}
{
  const {
    [(eff(), 'w')]: {
      from: f4
    }
  } = {
    w: Array
  };
}