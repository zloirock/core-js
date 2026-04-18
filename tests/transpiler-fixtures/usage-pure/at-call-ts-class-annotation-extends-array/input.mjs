class MyArr extends Array<string> {}
function foo(x: MyArr) {
  x.at(0);
}
