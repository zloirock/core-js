// destructured param with a default ({ x } = { x: "fallback" }) called with an overriding arg
// whose x is an array - the arg wins over the default, so the returned x narrows to Array
function getData({ x } = { x: "fallback" }) {
  return x;
}
getData({ x: [1, 2, 3] }).at(-1);
