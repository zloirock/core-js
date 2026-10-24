import "core-js/modules/es.array.at";
// A private parameter keeps its closed default receiver fact after body-entry capture.
// This isolated row must import only the Array.at family.
const source = [1, 2];
{
  function read({
    at
  } = source) {
    return at;
  }
}