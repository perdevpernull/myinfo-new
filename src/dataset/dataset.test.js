import { expect } from 'chai';
import { dataset } from './dataset';

describe('Dataset', () => {
  describe('Constructor', () => {
    it('Shouldn\'t throw an error', () => {
      var a = 'Hello';
      var x = dataset();
      expect(1).to.equal(1);
    });
  });
});
