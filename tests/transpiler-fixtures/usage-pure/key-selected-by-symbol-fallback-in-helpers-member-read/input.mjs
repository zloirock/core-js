const realm = typeof Symbol == 'function' ? Symbol : {};
export const memberRead = receiver => receiver[realm.iterator];
