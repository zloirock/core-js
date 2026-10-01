const obj = {
  greet() {
    return 'hello';
  }
};

const fn = obj.greet;
fn.name.at(0);
