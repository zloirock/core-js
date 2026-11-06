import _Array$from from "@core-js/pure/actual/array/from";
// The known argument and the receiver default are served independently.
// A caller's custom value still reaches the native pattern unchanged.
function read({
  globalThis: {
    Array: {
      from
    }
  }
} = {
  globalThis: {
    Array: {
      from: _Array$from
    }
  }
}) {
  return from([7]);
}
read();
read({
  globalThis: {
    Array: {
      from: _Array$from
    }
  }
});
read({
  globalThis: {
    Array: {
      from: () => [17]
    }
  }
});