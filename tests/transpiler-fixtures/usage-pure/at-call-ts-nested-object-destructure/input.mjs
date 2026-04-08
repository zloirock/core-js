declare const data: { user: { friends: number[] } };
const { user: { friends } } = data;
friends.at(-1);
