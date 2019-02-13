import { dataset } from './dataset';

describe('Dataset', () => {
  let ds;

  describe('#constructor', () => {
    it('Should create new ds w/o any error', () => {
      const dsTmp = dataset();
      const json = dsTmp.getJsondb();
      ds = dataset(JSON.parse(json));
    });
  });

  describe('#addNode()', () => {
    it('Should return 2 when i addNode() to a newly created ds ([0,1] nodes)', () => {
      let newNodeID = ds.addNode('addNode2');
      expect(newNodeID).toEqual(2);
    });
  });

  describe('#addChildNode()', () => {
    it('Should return 3 and have a link when i addChildNode() to the ds ([0,1,2] nodes)', () => {
      let newNodeID = ds.addChildNode(2, 'addChildNode3');
      expect(newNodeID).toEqual(3);
      expect(ds.isLinked(2, 3, 'child')).toEqual(true);
    });
  });

  describe('#addParentNode()', () => {
    it('Should return 4 and have a link when i addParetNode() to the ds ([0,1,2,3] nodes)', () => {
      let newNodeID = ds.addParentNode(2, 'addParentNode4');
      expect(newNodeID).toEqual(4);
      expect(ds.isLinked(2, 4, 'parent')).toEqual(true);
    });
  });

  describe('#addFriendNode()', () => {
    it('Should return 5 and have a link when i addFriendNode() to the ds ([0,1,2,3,4] nodes)', () => {
      let newNodeID = ds.addFriendNode(2, 'addFriendNode5');
      expect(newNodeID).toEqual(5);
      expect(ds.isLinked(2, 5, 'friend')).toEqual(true);
    });
  });

  describe('#deleteNode()', () => {
    it('Should return false when i try to delete a non-existent node', () => {
      let result = ds.deleteNode(100);
      expect(result).toEqual(false);
    });

    it('Should return true when i try to delete an existing non-deleted node', () => {
      let result = ds.deleteNode(5);
      expect(result).toEqual(true);
    });

    it('Should return false when i try to delete an existing already deleted node', () => {
      let result = ds.deleteNode(5);
      expect(result).toEqual(false);
    });
  });

  describe('#undeleteNode()', () => {
    it('Should return false when i try to undelete a non-existent node', () => {
      let result = ds.undeleteNode(100);
      expect(result).toEqual(false);
    });

    it('Should return false when i try to undelete an existing non-deleted node', () => {
      let result = ds.undeleteNode(4);
      expect(result).toEqual(false);
    });

    it('Should return true when i try to undelete an existing already deleted node', () => {
      let result = ds.undeleteNode(5);
      expect(result).toEqual(true);
    });
  });

  describe('#purgeNode()', () => {
    it('Should return false when i try to purge a non-existent node', () => {
      let result = ds.purgeNode(100);
      expect(result).toEqual(false);
    });

    it('Should return false when i try to delete an existing non-deleted node', () => {
      let result = ds.purgeNode(0);
      expect(result).toEqual(false);
    });

    it('Should return true when i try to delete an exiting already deleted node', () => {
      ds.deleteNode(5);
      let result = ds.purgeNode(5);
      expect(result).toEqual(true);
    });
  });

  describe('#getConnectedNodesBulk()', () => {
    it('Should return the related nodeIDs in accordance with type and tags', () => {
      ds.addChildNode(2, 'SiblinkTo3');
      let result = ds.getConnectedNodes(3, 'sibling');
      // console.log(result);
      expect(result).toEqual([6]);
    });
  });

  describe('#isDeletedNode()', () => {
    it('Should return true when i check a deleted node', () => {
      let newNodeID = ds.addNode('isDeletedNode');
      ds.deleteNode(newNodeID);
      expect(ds.isDeletedNode(newNodeID)).toEqual(true);
    });
  });

  describe('#addLink()', () => {
    it('Should return false when i try to add an existing link', () => {
      expect(ds.addLink(2, 3, 'child')).toEqual(false);
    });

    it('Should return true when i try to add an exiting but deleted link', () => {
      ds.deleteLink(2, 3, 'child');
      expect(ds.addLink(2, 3, 'child')).toEqual(true);
    });

    it('Should return true when i try to add a non-existent link', () => {
      expect(ds.addLink(3, 4, 'friend')).toEqual(true);
    });
  });

  describe('#deleteLink()', () => {
    it('Should return false when i try to delet a non-existent link', () => {
      expect(ds.deleteLink(0, 1, 'friend')).toEqual(false);
    });

    it('Should return false when i try to delet an already deleted link', () => {
      ds.deleteLink(2, 3, 'child');
      expect(ds.deleteLink(2, 3, 'child')).toEqual(false);
    });

    it('Should return true when i try to delet an exiting link', () => {
      ds.undeleteLink(2, 3, 'child');
      expect(ds.deleteLink(2, 3, 'child')).toEqual(true);
    });
  });

  describe('#undeleteLink()', () => {
    it('Should return false when i try to undelet a non-existent link', () => {
      expect(ds.undeleteLink(0, 1, 'friend')).toEqual(false);
    });

    it('Should return false when i try to undelet a non-deleted link', () => {
      ds.undeleteLink(2, 3, 'child');
      expect(ds.undeleteLink(2, 3, 'child')).toEqual(false);
    });

    it('Should return true when i try to undelet a deleted link', () => {
      ds.deleteLink(2, 3, 'child');
      expect(ds.undeleteLink(2, 3, 'child')).toEqual(true);
    });
  });

  describe('#purgeLink()', () => {
    it('Should return false when i try to purge a non-existent link', () => {
      expect(ds.purgeLink(0, 1, 'friend')).toEqual(false);
    });

    it('Should return false when i try to purge a non-deleted link', () => {
      expect(ds.purgeLink(2, 3, 'child')).toEqual(false);
    });

    it('Should return true when i try to purge a deleted link', () => {
      ds.deleteLink(2, 3, 'child');
      expect(ds.purgeLink(2, 3, 'child')).toEqual(true);
    });
  });

  describe('#isLinked()', () => {
    it('Should return false for a non-existent link', () => {
      expect(ds.isLinked(0, 1, 'friend')).toEqual(false);
    });

    it('Should return true for a non-deleted link', () => {
      ds.addLink(2, 3, 'child');
      expect(ds.isLinked(2, 3, 'child')).toEqual(true);
    });

    it('Should return true for a deleted link', () => {
      ds.deleteLink(2, 3, 'child');
      expect(ds.isLinked(2, 3, 'child')).toEqual(true);
    });
  });

  describe('#isDeletedLink()', () => {
    it('Should return false for a non-existent link', () => {
      expect(ds.isDeletedLink(0, 1, 'friend')).toEqual(false);
    });

    it('Should return true for a deleted link', () => {
      expect(ds.isDeletedLink(2, 3, 'child')).toEqual(true);
    });

    it('Should return false for a non-deleted link', () => {
      ds.undeleteLink(2, 3, 'child');
      expect(ds.isDeletedLink(2, 3, 'child')).toEqual(false);
    });
  });
});
