type Nullable = null | undefined;
declare const items: string[] | Nullable;
items.at(0).at(0);
items.at(0).includes('x');
