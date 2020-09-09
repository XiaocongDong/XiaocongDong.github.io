const testCases = {}
testCases['helloworld.simple'] = `console.log('Hello World');`
testCases['variable.simple'] = `let n = 10;
let b = true;
let s = 'string';
let f = function(x, y, z) {return x + y * z;};
let a = [1, 2, 3, {name: 'hi'}, 'hi'];
let o = {
  name: 'sean',
  age: 27
};

console.log(b);
console.log(s);
console.log(f(1,2,3));
console.log(a[1]);
console.log(o.name);
`
testCases['counter(closure).simple'] = `function createCounter() {
  let a = 0;
  return function() {
      a = a + 1;
      return a;
  };
};

let c1 = createCounter();
let c2 = createCounter();
console.log(c1());
console.log(c1());
console.log(c2());
console.log(c2());
`
testCases['fibonacci(Closure).simple'] = `function fib() {
  let a = 0;
  let b = 1;
  return function() {
      let c = a + b;
      a = b;
      b = c;
      return a;
  };
};

let f = fib();
for (let n = 0; n < 50; n++) {
  console.log(f());
};
`
testCases['functionalProgramming.simple'] = `function caller(callback) {
  callback();
};
let b = 10;
caller(function() {
  console.log(10);
});
caller(function() {
  console.log(11);
});
`
testCases['thisBinding.simple'] = `let person = {
  name: 'sean',
  sayName: function() {
    console.log(this.name);
  }
};
person.sayName();
`

export default testCases
