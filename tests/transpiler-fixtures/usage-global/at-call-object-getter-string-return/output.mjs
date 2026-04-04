import "core-js/modules/es.string.at";
const obj = {
  get name() {
    return 'hello';
  }
};
obj.name.at(0);