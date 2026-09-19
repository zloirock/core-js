// A member target rooted in a local object receives the extracted static.
const holder = {};
({ from: holder.from } = Array);
export { holder };
