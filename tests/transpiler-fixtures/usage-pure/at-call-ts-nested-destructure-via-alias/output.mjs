import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
type Container = {
  user: {
    friends: string[];
  };
};
declare const data: Container;
const {
  user: {
    friends
  }
} = data;
_atMaybeArray(friends).call(friends, -1);