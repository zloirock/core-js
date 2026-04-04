import "core-js/modules/es.string.at";
function getDefault(x = 'hello') {
  return x;
}
getDefault().at(0);