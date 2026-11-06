// A computed key in a literal-object loop head retains its effect and native keys read on each iteration.
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