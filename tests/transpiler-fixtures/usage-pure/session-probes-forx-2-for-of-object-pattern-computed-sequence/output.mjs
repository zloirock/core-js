// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Reads and effects remain inside their source control-flow positions.
const k = 'k';
function eff() {
  return Object;
}
{
  for (const {
    w: {
      [(eff(), 'keys')]: k
    }
  } of [{
    w: Object
  }, {
    w: Object
  }]) k;
}