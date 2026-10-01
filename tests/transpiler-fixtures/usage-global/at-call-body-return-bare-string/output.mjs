import "core-js/modules/es.string.at";
function getData(x) {
  if (x) return 'hello';
  return;
}
getData(true).at(0);