import './html/index.html';
import './html/favicon.ico';
import { dataset } from '../dataset/dataset';
import { settings } from './settings/settings';
import { userdata } from './userdata/userdata';

function myinfo (name) {
  console.log(`Hello ${name}`);
}

const ds = dataset();
console.log(ds.getJsondb());

export { myinfo };
