const config: { items: string[] } = getConfig();
const x: typeof config.items = config.items;
x.at(-1);
