import "core-js/modules/es.string.at";
// A private parameter keeps its closed default receiver fact after body-entry capture.
// This isolated row must import only the String.at family.
const source = 'ab';
{
  function read({
    at
  } = source) {
    return at;
  }
}