// usage-pure method call whose ARGUMENT is a depth-2 chain sharing the outer chain's receiver and
// first-method prefix (`x.flat().includes(x.flat().at(0))`): the same nth-recovery root as the
// sibling-branch case - the shared prefix must not be re-targeted across the two chains. regression lock
function f(x) {
  return x.flat().includes(x.flat().at(0));
}
f;
