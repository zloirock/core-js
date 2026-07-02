import "core-js/modules/es.string.at";
const obj = {
  name: 'alice',
  count: 42
} as const;
obj.name.at(0);