import "core-js/modules/es.string.at";
function getText() {
  try {
    return 'hello';
  } catch (e) {
    return 42;
  } finally {
    return 'world';
  }
}
getText().at(0);