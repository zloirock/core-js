namespace NS {
  export type Coll = number[];
}
function qualified<Coll>(x: NS.Coll) {
  return x.includes(1);
}
