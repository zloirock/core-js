import _includes from "@core-js/pure/actual/instance/includes";
const obj = {
  includes: str => _includes(str).call(str, "x")
};
const {
  includes
} = obj;