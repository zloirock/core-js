import "core-js/modules/es.string.at";
const prefix = 'hello';
const {
  name
} = {
  name: `${prefix} world`
};
name.at(0);