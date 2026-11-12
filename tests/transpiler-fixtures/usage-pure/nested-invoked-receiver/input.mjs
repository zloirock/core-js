// Optional calls and tags remain whole user receivers, preserving their this value.
const { list: { at } } = owner.make?.();
const { list: { includes } } = (note(), owner.tag`source`);
