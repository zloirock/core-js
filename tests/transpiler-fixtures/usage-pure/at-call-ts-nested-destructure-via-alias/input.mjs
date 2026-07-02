type Container = { user: { friends: string[] } };
declare const data: Container;
const { user: { friends } } = data;
friends.at(-1);
