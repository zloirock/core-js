// A closed method caller supplies the receiver; global injection covers only its selected static.
const box = { read({ from }) { return from([1]); } };
box.read(Array);
