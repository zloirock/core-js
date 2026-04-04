import "core-js/modules/es.string.repeat";
import "core-js/modules/es.number.to-fixed";
const other = {
  count: 'hello'
};
const obj = {
  count: 42,
  ...other
};
obj.count.toFixed(2);