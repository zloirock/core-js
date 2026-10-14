// An assignment pattern reading a static's `name` beside an unknown computed key off the constructor: the
// `name` claim loads its module beside the static's.
let name, zk;
({ from: { name } = {}, [k]: zk } = Array);
