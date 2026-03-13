import "core-js/modules/es.string.at";
const a = 'hello';
const b = a;
const {
  text
} = {
  text: b
};
text.at(0);