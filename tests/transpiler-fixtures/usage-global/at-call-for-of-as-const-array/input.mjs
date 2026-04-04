const items = ['hello', 'world'] as const;
for (const item of items) {
  item.at(0);
}
