// Assignment heads keep writing their original targets on every iteration.
let at;
for ({ at } of [[1, 2], [3, 4]]) consume(at);
consume(at);
const target = {};
outer: for ({ at: target.method } of [[5, 6]]) {
  consume(target.method);
  continue outer;
}
for ({ at } of unknownRows) consume(at);
