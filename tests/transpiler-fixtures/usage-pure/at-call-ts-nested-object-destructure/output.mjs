import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
declare const data: {
  user: {
    friends: number[];
  };
};
const {
  user: {
    friends
  }
} = data;
_atMaybeArray(friends).call(friends, -1);