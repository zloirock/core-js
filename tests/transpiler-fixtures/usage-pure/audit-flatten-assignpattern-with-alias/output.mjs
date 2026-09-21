import _Array$from from "@core-js/pure/actual/array/from";
import _Object$entries from "@core-js/pure/actual/object/entries";
// A pattern default and renamed static binding retain the source binding name.
// Each known static receives its own pure method.
const {
  Array: {
    from: myFrom
  } = {}
} = {
  Array: {
    from: _Array$from
  }
};
const {
  Object: {
    entries: myEntries
  } = {}
} = {
  Object: {
    entries: _Object$entries
  }
};
myFrom('hi');
myEntries({
  k: 1
});