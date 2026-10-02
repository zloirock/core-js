// A function with no external callers retains the type of its object parameter default.
function process({ name } = { name: 'hello' }) {
  name.at(0);
}
