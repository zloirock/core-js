const {
  name,
  ...rest
} = {
  name: 'alice',
  age: 30
};
rest.at(0);