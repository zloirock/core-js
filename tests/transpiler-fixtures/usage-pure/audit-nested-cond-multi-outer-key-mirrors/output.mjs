import _Array$from from "@core-js/pure/actual/array/from";
import _JSON$stringify from "@core-js/pure/actual/json/stringify";
// MULTIPLE outer proxy keys (`Array`, `JSON`): each mirrors its inner static into the synth
// literal independently, the user-object branch stays verbatim
const userObj = {
  Array: {
    from: () => "uf"
  },
  JSON: {
    stringify: () => "us"
  }
};
const {
  Array: {
    from
  },
  JSON: {
    stringify
  }
} = c ? {
  Array: {
    from: _Array$from
  },
  JSON: {
    stringify: _JSON$stringify
  }
} : userObj;
from([1]);
stringify({});