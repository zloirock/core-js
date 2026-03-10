function getData() {
  function inner() {
    return 'hello';
  }
  return [1, 2, 3];
}
getData().at(-1);
