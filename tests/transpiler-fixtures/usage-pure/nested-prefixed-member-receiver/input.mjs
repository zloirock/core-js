// The prefix and both getter reads belong to one extraction, including assignment hosts.
const { list: { at } } = (note(), owner.value);
let includes;
({ list: { includes } } = (note(), owner['value']));
