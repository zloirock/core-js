// Object-rest keeps the affected method slots native; computed symbol keys still polyfill.
// Independent reads and key/default expressions still receive their own polyfills.
class A extends Array { static f() { const { [Symbol.iterator]: iter, ...rest } = super.from([]); } }
