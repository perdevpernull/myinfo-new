import { myinfo } from './myinfo/myinfo';

// Log message to console
console.log('A very warm welcome 1 !');

// Needed for Hot Module Replacement
if (typeof (module.hot) !== 'undefined') {
  module.hot.accept(); // eslint-disable-line no-undef
}

myinfo('Péter');

console.log('A very warm welcome 2 !');

function haha (x) {
  myinfo(x);
}

export { haha };
