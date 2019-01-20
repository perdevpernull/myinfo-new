import { sandboxFactory as sf} from './sandbox/sandbox';

var a = 'Hello';
var x = sf(a);
console.log(x.test());
