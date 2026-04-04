import "core-js/modules/es.array.at";
const obj = {
  getData: function () {
    return [1, 2, 3];
  }
};
obj.getData().at(-1);