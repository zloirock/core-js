const key1 = 'items';
const key2 = key1;
const { [key2]: arr } = { items: [1, 2, 3] };
arr.at(0);
