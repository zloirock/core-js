import "core-js/modules/es.string.at";
const KEY = 'name' as const;
const obj = {
  name: 'alice',
  count: 42
};
obj[KEY].at(0);