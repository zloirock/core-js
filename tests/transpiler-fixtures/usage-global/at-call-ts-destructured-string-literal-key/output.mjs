import "core-js/modules/es.string.at";
function foo(x: {
  'content-type': string;
}) {
  const {
    'content-type': ct
  } = x;
  ct.at(0);
}