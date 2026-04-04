import "core-js/modules/es.string.at";
const {
  name
} = {
  get name() {
    return 'hello';
  }
};
name.at(0);