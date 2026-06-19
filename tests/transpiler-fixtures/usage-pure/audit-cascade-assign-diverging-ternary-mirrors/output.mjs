import _Array$from from "@core-js/pure/actual/array/from";
// an assignment-cascade host whose RHS is a ternary with DIVERGING branches: a global proxy vs a
// user object. each branch is mirrored independently - the proxy branch becomes a synth literal
// binding the polyfill, the user-object branch stays verbatim, the assignment structure preserved
let from;
let pick = false;
const userObj = {
  Array: {
    from: function () {
      return 'USER';
    }
  }
};
({
  Array: {
    from
  }
} = pick ? {
  Array: {
    from: _Array$from
  }
} : userObj);