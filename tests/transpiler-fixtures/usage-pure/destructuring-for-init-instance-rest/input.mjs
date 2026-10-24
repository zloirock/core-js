// Object-rest keeps the affected loop pattern native at its original evaluation point.
// Independent reads and key/default expressions still receive their own polyfills.
for (var { includes, ...rest } = obj;;) break;
