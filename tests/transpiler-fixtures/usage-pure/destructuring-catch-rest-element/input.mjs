// Object-rest keeps the affected catch pattern native, including its named method slots.
// Independent reads and key/default expressions still receive their own polyfills.
try {} catch ({ includes, ...rest }) { includes("x"); rest.foo(); }
