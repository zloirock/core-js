import _atMaybeString from "@core-js/pure/actual/string/instance/at";
namespace Box {
  const key = 'name';
  let value;
  ({
    outer: {
      [key]: value
    }
  } = {
    outer: {
      name: 'alice'
    }
  });
  _atMaybeString(value).call(value, -1);
}