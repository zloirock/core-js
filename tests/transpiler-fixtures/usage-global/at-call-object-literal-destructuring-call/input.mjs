function getName() { return 'alice'; }
const { name } = { name: getName() };
name.at(0);
