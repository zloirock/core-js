declare const maybeItems: string[] | null;
const items = maybeItems!;
for (const item of items) {
  item.at(0);
}
