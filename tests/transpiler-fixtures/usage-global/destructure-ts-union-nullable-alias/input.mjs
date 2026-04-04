type Nullable = null | undefined;
declare const items: string[] | Nullable;
const [first, second] = items;
first.at(0).strike();
second.at(0).bold();
