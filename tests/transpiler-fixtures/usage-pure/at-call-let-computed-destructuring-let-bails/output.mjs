import _at from "@core-js/pure/actual/instance/at";
let key = 'name';
key = 'other';
let val;
({
  [key]: val
} = {
  name: 'alice'
});
_at(val).call(val, -1);