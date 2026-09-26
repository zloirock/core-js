// A closed method caller set supplies the selected static to its parameter.
const box = { read({ from }) { return from([1]); } };
box.read(Array);
