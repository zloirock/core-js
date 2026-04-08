function fn() {}
function thrown() {
  throw 1;
}
fn().at(0).includes(1);
thrown().at(0).includes(1);