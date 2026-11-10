import "core-js/modules/es.string.at";
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
  value.at(-1);
}