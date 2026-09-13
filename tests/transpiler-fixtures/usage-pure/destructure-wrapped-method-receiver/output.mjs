import _includes from "@core-js/pure/actual/instance/includes";
// Extracting a method from a wrapped object lets its caller supply another receiver.
// The declared rows are an array, but the borrowed call reads a string: both includes families
// remain possible inside the method, while the wrapper and extraction keep their source form.
const holder = {
  rows: ['a', 'b'],
  read() {
    var _ref;
    return _includes(_ref = this.rows).call(_ref, 'a,b');
  }
};
const [{
  read
}] = [holder];
export default read.call({
  rows: 'a,b'
});