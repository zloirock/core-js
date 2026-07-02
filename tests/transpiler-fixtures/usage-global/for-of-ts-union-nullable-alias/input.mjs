type Nullable = null | undefined;
declare const items: string[] | Nullable;
for (const item of items) item.at(0).fontcolor('red');
