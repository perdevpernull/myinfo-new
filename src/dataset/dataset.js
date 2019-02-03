function dataset (jsonData) {
  const _private_ = {};

  class Dataset {
    constructor (jsonData) {
      if (jsonData && jsonData.nextNodeID) {
        // ToDo: Before storing the jsonData we should validate the schema (e.g. https://github.com/hapijs/joi)
        // ToDo: Or maybe outside of the class before calling new decide if the schema is valid or not!?
        _private_.data = jsonData;
      } else {
        _private_.data = {
          nextNodeID: 2,
          nodes: {
            ID0: {
              ID: 0,
              text: 'Root node',
              links: [
                { toID: 1, type: 'child', tags: [], deleted: false }
              ],
              tags: [],
              deleted: false
            },
            ID1: {
              ID: 1,
              text: 'Child node',
              links: [
                { toID: 0, type: 'parent', tags: [], deleted: false }
              ],
              tags: [],
              deleted: false
            }
          },
          tags: {},
          rootNodes: {
            ID0: 0
          },
          pluginData: {}
        };
      }
    }

    getJsonData () {
      return JSON.stringify(_private_.data);
    }

    getTypePair (type) {
      return (type === 'child') ? 'parent' : ((type === 'parent') ? 'child' : 'friend');
    }

    // Node functions ADD
    addNode (text, tags = []) {
      const newNodeID = _private_.data.nextNodeID;
      _private_.data.nextNodeID = _private_.data.nextNodeID + 1;
      _private_.data.nodes[`ID${newNodeID}`] = {
        ID: newNodeID,
        text: text,
        links: [],
        tags: tags,
        deleted: false
      };

      _private_.data.rootNodes[`ID${newNodeID}`] = newNodeID;

      return newNodeID;
    }

    addChildNode (nodeID, text, tags = []) {
      const newChildNodeID = this.addNode(text, tags);
      this.addChildLink(nodeID, newChildNodeID);

      return newChildNodeID;
    }

    addParentNode (nodeID, text, tags = []) {
      const newParentNodeID = this.addNode(text, tags);
      this.addParentLink(nodeID, newParentNodeID);

      return newParentNodeID;
    }

    addFriendNode (nodeID, text, tags = []) {
      const newFriendNodeID = this.addNode(text, tags);
      this.addFriendLink(nodeID, newFriendNodeID);

      return newFriendNodeID;
    }

    // Node functions DELETE
    deleteNode (nodeID) {
      if (!_private_.data.nodes[`ID${nodeID}`]) {
        // We cannot delete a non-existent node.
        return false;
      } else {
        if (_private_.data.nodes[`ID${nodeID}`].deleted) {
          // We cannot delete an already deleted node.
          return false;
        } else {
          let toID;
          let type;
          let typePair;
          let linkIndex;

          _private_.data.nodes[`ID${nodeID}`].deleted = true;

          for (let i in _private_.data.nodes[`ID${nodeID}`].links) {
            if (!_private_.data.nodes[`ID${nodeID}`].links[i].deleted) {
              _private_.data.nodes[`ID${nodeID}`].links[i].deleted = true;

              toID = _private_.data.nodes[`ID${nodeID}`].links[i].toID;
              type = _private_.data.nodes[`ID${nodeID}`].links[i].type;
              typePair = this.getTypePair(type);

              linkIndex = _private_.data.nodes[`ID${toID}`].links.findIndex(function (link) {
                return ((link.toID === nodeID) && (link.type === typePair));
              });
              _private_.data.nodes[`ID${toID}`].links[linkIndex].deleted = true;

              if (type === 'child') {
                if (!this.hasParentLinks(toID)) {
                  _private_.data.rootNodes[`ID${toID}`] = toID;
                }
              }
            }
          }

          delete _private_.data.rootNodes[`ID${nodeID}`];

          return true;
        }
      }
    }

    undeleteNode (nodeID) {
      if (!_private_.data.nodes[`ID${nodeID}`]) {
        // We cannot undelete a non-existent node.
        return false;
      } else {
        if (!_private_.data.nodes[`ID${nodeID}`].deleted) {
          // We cannot undelete a non-deleted node.
          return false;
        } else {
          let toID;
          let type;
          let typePair;
          let linkIndex;

          _private_.data.nodes[`ID${nodeID}`].deleted = false;

          for (let i in _private_.data.nodes[`ID${nodeID}`].links) {
            toID = _private_.data.nodes[`ID${nodeID}`].links[i].toID;
            if (!this.isDeletedNode(toID)) {
              _private_.data.nodes[`ID${nodeID}`].links[i].deleted = false;

              type = _private_.data.nodes[`ID${nodeID}`].links[i].type;
              typePair = this.getTypePair(type);

              linkIndex = _private_.data.nodes[`ID${toID}`].links.findIndex(function (link) {
                return ((link.toID === nodeID) && (link.type === typePair));
              });
              _private_.data.nodes[`ID${toID}`].links[linkIndex].deleted = false;

              if (typePair === 'parent') {
                delete _private_.data.rootNodes[`ID${toID}`];
              }
            }
          }

          if (!this.hasParentLinks(nodeID)) {
            _private_.data.rootNodes[`ID${nodeID}`] = nodeID;
          }

          return true;
        }
      }
    }

    purgeNode (nodeID) {
      if (!_private_.data.nodes[`ID${nodeID}`]) {
        // We cannot purge a non-existent node.
        return false;
      } else {
        if (!_private_.data.nodes[`ID${nodeID}`].deleted) {
          // We cannot purge a non-deleted node.
          return false;
        } else {
          let toID;
          let type;

          for (let i in _private_.data.nodes[`ID${nodeID}`].links) {
            toID = _private_.data.nodes[`ID${nodeID}`].links[i].toID;
            type = _private_.data.nodes[`ID${nodeID}`].links[i].type;
            this.purgeLink(nodeID, toID, type);
          }

          delete _private_.data.nodes[`ID${nodeID}`];

          return true;
        }
      }
    }

    // Node functions QUERY
    getConnectedNodes (nodeID, type, tags = [], deleted = false) {
      return this.getConnectedNodesBulk([nodeID], type, tags, deleted);
    }

    getConnectedNodesBulk (nodeIDs, type, tags = [], deleted = false) {
      let result = [];

      if (type === 'sibling') {
        let parentNodeIDs = this.getConnectedNodesBulk(nodeIDs, 'parent', tags, deleted);
        result = this.getConnectedNodesBulk(parentNodeIDs, 'child', tags, deleted).filter((value) => (nodeIDs.indexOf(value) < 0));
      } else {
        for (let i in nodeIDs) {
          for (let j in _private_.data.nodes[`ID${nodeIDs[i]}`].links) {
            let link = _private_.data.nodes[`ID${nodeIDs[i]}`].links[j];
            if ((link.deleted === deleted) && ((!type) || (link.type === type)) && (tags.every((value) => (link.tags.indexOf(value) >= 0)))) {
              result.push(link.toID);
            }
          }
        }
      }

      return result;
    }

    isDeletedNode (nodeID) {
      return _private_.data.nodes[`ID${nodeID}`].deleted;
    }

    // Link functions ADD
    addLink (nodeID1, nodeID2, type, tags = []) {
      if (this.isLinked(nodeID1, nodeID2, type)) {
        // Link already exists
        if (this.isDeletedLink(nodeID1, nodeID2, type)) {
          // The link is deleted
          return this.undeleteLink(nodeID1, nodeID2, type);
        } else {
          return false;
        }
      } else {
        if (type === 'parent') {
          return this.addLink(nodeID2, nodeID1, 'child', tags);
        } else {
          // type can only be 'child' or 'friend'
          let deleted = (_private_.data.nodes[`ID${nodeID1}`].deleted || _private_.data.nodes[`ID${nodeID2}`].deleted);

          if (type === 'child') {
            delete _private_.data.rootNodes[`ID${nodeID2}`];
          }

          _private_.data.nodes[`ID${nodeID1}`].links.push(
            { toID: nodeID2, type: type, tags: tags, deleted: deleted }
          );
          _private_.data.nodes[`ID${nodeID2}`].links.push(
            { toID: nodeID1, type: this.getTypePair(type), tags: tags, deleted: deleted }
          );

          return true;
        }
      }
    }

    addChildLink (parentNodeID, childNodeID, tags = []) {
      return this.addLink(parentNodeID, childNodeID, 'child', tags);
    }

    addParentLink (childNodeID, parentNodeID, tags = []) {
      return this.addLink(parentNodeID, childNodeID, 'child', tags);
    }

    addFriendLink (nodeID1, nodeID2, tags = []) {
      return this.addLink(nodeID1, nodeID2, 'friend', tags);
    }

    // Link functions DELETE
    deleteLink (nodeID1, nodeID2, type) {
      if (!this.isLinked(nodeID1, nodeID2, type)) {
        // We cannot delete nonexistent link.
        return false;
      } else {
        if (this.isDeletedLink(nodeID1, nodeID2, type)) {
          // We cannot delete an already deleted link
          return false;
        } else {
          if (type === 'parent') {
            this.deleteLink(nodeID2, nodeID1, 'child');
          } else {
            // type can only be 'child' or 'friend'
            let linkIndex;

            linkIndex = _private_.data.nodes[`ID${nodeID1}`].links.findIndex(function (link) {
              return ((link.toID === nodeID2) && (link.type === type));
            });
            if (!_private_.data.nodes[`ID${nodeID1}`].links[linkIndex].deleted) {
              _private_.data.nodes[`ID${nodeID1}`].links[linkIndex].deleted = true;
            } else {
              return false;
            }

            const typePair = this.getTypePair(type);
            linkIndex = _private_.data.nodes[`ID${nodeID2}`].links.findIndex(function (link) {
              return ((link.toID === nodeID1) && (link.type === typePair));
            });
            if (!_private_.data.nodes[`ID${nodeID2}`].links[linkIndex].deleted) {
              _private_.data.nodes[`ID${nodeID2}`].links[linkIndex].deleted = true;
            } else {
              return false;
            }

            if (type === 'child') {
              if (!this.hasParentLinks(nodeID2)) {
                _private_.data.rootNodes[`ID${nodeID2}`] = nodeID2;
              }
            }

            return true;
          }
        }
      }
    }

    undeleteLink (nodeID1, nodeID2, type) {
      if (!this.isLinked(nodeID1, nodeID2, type)) {
        // We cannot undelete nonexistent link.
        return false;
      } else {
        if (!this.isDeletedLink(nodeID1, nodeID2, type)) {
          // We cannot undelete a non-deleted link.
          return false;
        } else {
          if (type === 'parent') {
            this.undeleteLink(nodeID2, nodeID1, 'child');
          } else {
            // type can only be 'child' or 'friend'
            let linkIndex;

            linkIndex = _private_.data.nodes[`ID${nodeID1}`].links.findIndex(function (link) {
              return ((link.toID === nodeID2) && (link.type === type));
            });
            if (_private_.data.nodes[`ID${nodeID1}`].links[linkIndex].deleted) {
              _private_.data.nodes[`ID${nodeID1}`].links[linkIndex].deleted = false;
            } else {
              return false;
            }

            const typePair = this.getTypePair(type);
            linkIndex = _private_.data.nodes[`ID${nodeID2}`].links.findIndex(function (link) {
              return ((link.toID === nodeID1) && (link.type === typePair));
            });
            if (_private_.data.nodes[`ID${nodeID2}`].links[linkIndex].deleted) {
              _private_.data.nodes[`ID${nodeID2}`].links[linkIndex].deleted = false;
            } else {
              return false;
            }

            if (type === 'child') {
              delete _private_.data.rootNodes[`ID${nodeID2}`];
            }

            return true;
          }
        }
      }
    }

    purgeLink (nodeID1, nodeID2, type) { // Csak törölt státuszút lehet véglegesen törölni.
      if (!this.isLinked(nodeID1, nodeID2, type)) {
        // We cannot purge nonexistent link.
        return false;
      } else {
        if (!this.isDeletedLink(nodeID1, nodeID2, type)) {
          // We cannot purge a non-deleted link.
          return false;
        } else {
          if (type === 'parent') {
            // ToDo: This should be checked first.
            return this.purgeLink(nodeID2, nodeID1, 'child');
          } else {
            // type can only be 'child' or 'friend'
            let linkIndex;
            let typePair = this.getTypePair(type);

            linkIndex = _private_.data.nodes[`ID${nodeID1}`].links.findIndex(function (link) {
              return ((link.toID === nodeID2) && (link.type === type));
            });
            if (!_private_.data.nodes[`ID${nodeID1}`].links[linkIndex].deleted) {
              // We cannot purge nondeleted link.
              return false;
            } else {
              _private_.data.nodes[`ID${nodeID1}`].links.splice(linkIndex, 1);
            }

            linkIndex = _private_.data.nodes[`ID${nodeID2}`].links.findIndex(function (link) {
              return ((link.toID === nodeID1) && (link.type === typePair));
            });
            if (!_private_.data.nodes[`ID${nodeID2}`].links[linkIndex].deleted) {
              // We cannot purge nondeleted link.
              return false;
            } else {
              _private_.data.nodes[`ID${nodeID2}`].links.splice(linkIndex, 1);
            }

            return true;
          }
        }
      }
    }

    // Link functions QUERY
    isLinked (nodeID1, nodeID2, type) { // Törölt státuszúakat is vizsgálja.
      return (_private_.data.nodes[`ID${nodeID1}`].links.findIndex(function (link) {
        return ((link.toID === nodeID2) && (link.type === type));
      }) > -1);
    }

    isDeletedLink (nodeID1, nodeID2, type) {
      return (_private_.data.nodes[`ID${nodeID1}`].links.findIndex(function (link) {
        return ((link.toID === nodeID2) && (link.type === type) && (link.deleted));
      }) > -1);
    }

    // NodeTag functions ADD
    addNodeTag (nodeID, tag) {
      if (!this.isTagExists(tag)) {
        _private_.data.tags[tag] = tag;
      }

      if (this.isNodeTagged(nodeID, tag)) {
        return false;
      } else {
        _private_.data.nodes[`ID${nodeID}`].tags.push(tag);

        return true;
      }
    }

    // Tag functions QUERY
    isTagExists (tag) {
      if (_private_.data.tags[tag]) {
        return true;
      } else {
        return false;
      }
    }

    // --> Cleared until this point.
    getRootNodeIDs () {
      return _private_.data.rootNodes;
    }

    findOrphanNodeIDs () {
      var possibleOrphanNodes = {};
      var orphanNodeKeys = {};
      var orphanNodeIDs = [];
      var ID;
      var childLinkIDs;
      var childLinks;
      var rootOrHasParentNodes;
      var keys;

      for (let key in _private_.data.nodes) {
        ID = _private_.data.nodes[key].ID;
        if (!this.isDeleted(ID)) {
          childLinks = this.getChildLinks(ID);
          childLinkIDs = [];
          for (var i in childLinks) {
            childLinkIDs.push(childLinks[i].toID);
          }
          possibleOrphanNodes[key] = { ID: ID, childLinkIDs: childLinkIDs };
        }
      }

      rootOrHasParentNodes = [];
      for (let key in _private_.data.rootNodes) {
        rootOrHasParentNodes.push(_private_.data.rootNodes[key]);
      }

      while (rootOrHasParentNodes.length > 0) {
        ID = rootOrHasParentNodes[0];
        if (possibleOrphanNodes[`ID${ID}`]) {
          for (let i in possibleOrphanNodes[`ID${ID}`].childLinkIDs) {
            rootOrHasParentNodes.push(possibleOrphanNodes[`ID${ID}`].childLinkIDs[i]);
          }
          delete possibleOrphanNodes[`ID${ID}`];
        }
        rootOrHasParentNodes.splice(0, 1);
      }

      keys = Object.keys(possibleOrphanNodes);
      while (keys.length > 0) {
        ID = possibleOrphanNodes[keys[0]].ID;
        orphanNodeKeys[`ID${ID}`] = ID;

        rootOrHasParentNodes = [];
        for (let i in possibleOrphanNodes[keys[0]].childLinkIDs) {
          rootOrHasParentNodes.push(possibleOrphanNodes[keys[0]].childLinkIDs[i]);
        }
        delete possibleOrphanNodes[keys[0]];

        while (rootOrHasParentNodes.length > 0) {
          ID = rootOrHasParentNodes[0];
          if (possibleOrphanNodes[`ID${ID}`]) {
            for (let i in possibleOrphanNodes[`ID${ID}`].childLinkIDs) {
              rootOrHasParentNodes.push(possibleOrphanNodes[`ID${ID}`].childLinkIDs[i]);
            }
            delete possibleOrphanNodes[`ID${ID}`];
          }
          rootOrHasParentNodes.splice(0, 1);
        }
        keys = Object.keys(possibleOrphanNodes);
      }

      for (let key in orphanNodeKeys) {
        orphanNodeIDs.push(_private_.data.nodes[key].ID);
      }
      return orphanNodeIDs;
    }

    isNodeTagged (nodeID, tag) {
      return (_private_.data.nodes[`ID${nodeID}`].tags.findIndex(function (element) {
        return (element === tag);
      }) > -1);
    }

    isLinkTagged (nodeID1, nodeID2, type, tag) {
      var linkIndex = _private_.data.nodes[`ID${nodeID1}`].links.findIndex(function (link) {
        return ((link.toID === nodeID2) && (link.type === type));
      });

      if (linkIndex > -1) {
        if (_private_.data.nodes[`ID${nodeID1}`].links[linkIndex].tags.findIndex(function (element) {
          return (element === tag);
        }
        ) > -1) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }

    addLinkTag (nodeID1, nodeID2, type, tag) {
      var linkIndex;
      var typePair = (type === 'child') ? 'parent' : ((type === 'parent') ? 'child' : type);

      if (!this.isLinked(nodeID1, nodeID2, type)) {
        return false;
      }

      if (this.isLinkTagged(nodeID1, nodeID2, type, tag)) {
        return false;
      }

      if (!this.isTagExists(tag)) {
        _private_.data.tags[tag] = tag;
      }

      linkIndex = _private_.data.nodes[`ID${nodeID1}`].links.findIndex(function (link) {
        return ((link.toID === nodeID2) && (link.type === type));
      });
      _private_.data.nodes[`ID${nodeID1}`].links[linkIndex].tags.push(tag);

      linkIndex = _private_.data.nodes[`ID${nodeID2}`].links.findIndex(function (link) {
        return ((link.toID === nodeID1) && (link.type === typePair));
      });
      _private_.data.nodes[`ID${nodeID2}`].links[linkIndex].tags.push(tag);

      return true;
    }

    getLinks (nodeID) {
      return _private_.data.nodes[`ID${nodeID}`].links.filter(function (link) {
        return (link.deleted === false);
      });
    }

    getChildLinks (nodeID) {
      return _private_.data.nodes[`ID${nodeID}`].links.filter(function (link) {
        return (link.type === 'child' && link.deleted === false);
      });
    }

    hasChildLinks (nodeID) {
      return (this.getChildLinks(nodeID).length > 0);
    }

    getParentLinks (nodeID) {
      return _private_.data.nodes[`ID${nodeID}`].links.filter(function (link) {
        return (link.type === 'parent' && link.deleted === false);
      });
    }

    hasParentLinks (nodeID) {
      return (this.getParentLinks(nodeID).length > 0);
    }

    getFriendLinks (nodeID) {
      return _private_.data.nodes[`ID${nodeID}`].links.filter(function (link) {
        return (link.type === 'friend' && link.deleted === false);
      });
    }

    hasFriendLinks (nodeID) {
      // log.DEBUG(`nodeID(${nodeID}).hasFriendLinks() = ${(this.getFriendLinks(nodeID).length > 0)}`);
      return (this.getFriendLinks(nodeID).length > 0);
    }

    getNode (nodeID) {
      return (_private_.data.nodes[`ID${nodeID}`]);
    }

    searchNodesByText (searchText) {
      var keys = Object.keys(_private_.data.nodes).filter(function (nodeKey) {
        // majd figyelni kell, h a deleted-ek ne szerepeljenek a listában.
        return ((!_private_.data.nodes[nodeKey].deleted) && (_private_.data.nodes[nodeKey].text.toLowerCase().indexOf(searchText.toLowerCase()) !== -1));
      });
      var result = [];
      for (var i in keys) {
        result.push({
          id: _private_.data.nodes[keys[i]].ID,
          text: _private_.data.nodes[keys[i]].text
        });
      }

      return result;
    }

    _setNodePluginData (pluginName, nodeID, data) {
      _private_.data.pluginData[pluginName].nodes[`ID${nodeID}`] = data;
    }

    _getNodePluginData (pluginName, nodeID) {
      return _private_.data.pluginData[pluginName].nodes[`ID${nodeID}`];
    }
  }

  return new Dataset(jsonData);
}

class OldDataset {
  constructor (jsonData) {
    if ((jsonData === undefined) || (jsonData.nextNodeID === undefined)) {
      _private_.data = {
        nextNodeID: 2,
        nodes: {
          ID0: {
            ID: 0,
            text: 'Root node',
            links: [
              { toID: 1, type: 'child', tags: [], deleted: false }
            ],
            tags: [],
            deleted: false
          },
          ID1: {
            ID: 1,
            text: 'Child node',
            links: [
              { toID: 0, type: 'parent', tags: [], deleted: false }
            ],
            tags: [],
            deleted: false
          }
        },
        tags: {},
        rootNodes: {
          ID0: 0
        },
        pluginData: {}
      };
    } else {
      _private_.data = jsonData;
    }
  }

  getJsonData () {
    return JSON.stringify(_private_.data);
  }

  addNode (text) {
    var nodeID = _private_.data.nextNodeID;
    _private_.data.nextNodeID = _private_.data.nextNodeID + 1;
    _private_.data.nodes[`ID${nodeID}`] = {
      ID: nodeID,
      text: text,
      links: [],
      tags: [],
      deleted: false
    };

    _private_.data.rootNodes[`ID${nodeID}`] = nodeID;

    return nodeID;
  }

  addChildNode (nodeID, text) {
    var childNodeID = this.addNode(text);
    this.addChildLink(nodeID, childNodeID);

    return childNodeID;
  }

  addParentNode (nodeID, text) {
    var parentNodeID = this.addNode(text);
    this.addParentLink(nodeID, parentNodeID);

    return parentNodeID;
  }

  addFriendNode (nodeID, text) {
    var friendNodeID = this.addNode(text);
    this.addFriendLink(nodeID, friendNodeID);

    return friendNodeID;
  }

  getRootNodeIDs () {
    return _private_.data.rootNodes;
  }

  findOrphanNodeIDs () {
    var possibleOrphanNodes = {};
    var orphanNodeKeys = {};
    var orphanNodeIDs = [];
    var ID;
    var childLinkIDs;
    var childLinks;
    var rootOrHasParentNodes;
    var keys;

    for (var key in _private_.data.nodes) {
      ID = _private_.data.nodes[key].ID;
      if (!this.isDeleted(ID)) {
        childLinks = this.getChildLinks(ID);
        childLinkIDs = [];
        for (var i in childLinks) {
          childLinkIDs.push(childLinks[i].toID);
        }
        possibleOrphanNodes[key] = { ID: ID, childLinkIDs: childLinkIDs };
      }
    }

    rootOrHasParentNodes = [];
    for (var key in _private_.data.rootNodes) {
      rootOrHasParentNodes.push(_private_.data.rootNodes[key]);
    }

    while (rootOrHasParentNodes.length > 0) {
      ID = rootOrHasParentNodes[0];
      if (possibleOrphanNodes[`ID${ID}`]) {
        for (var i in possibleOrphanNodes[`ID${ID}`].childLinkIDs) {
          rootOrHasParentNodes.push(possibleOrphanNodes[`ID${ID}`].childLinkIDs[i]);
        }
        delete possibleOrphanNodes[`ID${ID}`];
      }
      rootOrHasParentNodes.splice(0, 1);
    }

    keys = Object.keys(possibleOrphanNodes);
    while (keys.length > 0) {
      ID = possibleOrphanNodes[keys[0]].ID;
      orphanNodeKeys[`ID${ID}`] = ID;

      rootOrHasParentNodes = [];
      for (var i in possibleOrphanNodes[keys[0]].childLinkIDs) {
        rootOrHasParentNodes.push(possibleOrphanNodes[keys[0]].childLinkIDs[i]);
      }
      delete possibleOrphanNodes[keys[0]];

      while (rootOrHasParentNodes.length > 0) {
        ID = rootOrHasParentNodes[0];
        if (possibleOrphanNodes[`ID${ID}`]) {
          for (var i in possibleOrphanNodes[`ID${ID}`].childLinkIDs) {
            rootOrHasParentNodes.push(possibleOrphanNodes[`ID${ID}`].childLinkIDs[i]);
          }
          delete possibleOrphanNodes[`ID${ID}`];
        }
        rootOrHasParentNodes.splice(0, 1);
      }
      keys = Object.keys(possibleOrphanNodes);
    }

    for (key in orphanNodeKeys) {
      orphanNodeIDs.push(_private_.data.nodes[key].ID);
    }
    return orphanNodeIDs;
  }

  deleteNode (nodeID) {
    var toID;
    var type;
    var typePair;
    var linkIndex;

    if (_private_.data.nodes[`ID${nodeID}`].deleted) {
      return false;
    } else {
      _private_.data.nodes[`ID${nodeID}`].deleted = true;

      for (var i in _private_.data.nodes[`ID${nodeID}`].links) {
        if (!_private_.data.nodes[`ID${nodeID}`].links[i].deleted) {
          _private_.data.nodes[`ID${nodeID}`].links[i].deleted = true;

          toID = _private_.data.nodes[`ID${nodeID}`].links[i].toID;
          type = _private_.data.nodes[`ID${nodeID}`].links[i].type;
          typePair = (type === 'child') ? 'parent' : ((type === 'parent') ? 'child' : type);

          linkIndex = _private_.data.nodes[`ID${toID}`].links.findIndex(function (link) {
            return ((link.toID === nodeID) && (link.type === typePair));
          });
          _private_.data.nodes[`ID${toID}`].links[linkIndex].deleted = true;

          if (type === 'child') {
            if (!this.hasParentLinks(toID)) {
              _private_.data.rootNodes[`ID${toID}`] = toID;
            }
          }
        }
      }

      delete _private_.data.rootNodes[`ID${nodeID}`];

      return true;
    }
  }

  undeleteNode (nodeID) {
    var toID;
    var type;
    var typePair;
    var linkIndex;

    if (_private_.data.nodes[`ID${nodeID}`].deleted) {
      _private_.data.nodes[`ID${nodeID}`].deleted = false;

      for (var i in _private_.data.nodes[`ID${nodeID}`].links) {
        toID = _private_.data.nodes[`ID${nodeID}`].links[i].toID;
        if (!this.isDeleted(toID)) {
          _private_.data.nodes[`ID${nodeID}`].links[i].deleted = false;

          type = _private_.data.nodes[`ID${nodeID}`].links[i].type;
          typePair = (type === 'child') ? 'parent' : ((type === 'parent') ? 'child' : type);

          linkIndex = _private_.data.nodes[`ID${toID}`].links.findIndex(function (link) {
            return ((link.toID === nodeID) && (link.type === typePair));
          });
          _private_.data.nodes[`ID${toID}`].links[linkIndex].deleted = false;

          if (typePair === 'parent') {
            delete _private_.data.rootNodes[`ID${toID}`];
          }
        }
      }

      if (!this.hasParentLinks(nodeID)) {
        _private_.data.rootNodes[`ID${nodeID}`] = nodeID;
      }

      return true;
    } else {
      return false;
    }
  }

  purgeNode (nodeID) {
    var toID;
    var type;

    if (_private_.data.nodes[`ID${nodeID}`].deleted) {
      for (var i in _private_.data.nodes[`ID${nodeID}`].links) {
        toID = _private_.data.nodes[`ID${nodeID}`].links[i].toID;
        type = _private_.data.nodes[`ID${nodeID}`].links[i].type;
        this.purgeLink(nodeID, toID, type);
      }

      delete _private_.data.nodes[`ID${nodeID}`];

      return true;
    } else {
      // Only deleted nodes can be purged.
      return false;
    }
  }

  isLinked (nodeID1, nodeID2, type) { // Törölt státuszúakat is vizsgálja.
    return (_private_.data.nodes[`ID${nodeID1}`].links.findIndex(function (link) {
      return ((link.toID === nodeID2) && (link.type === type));
    }) > -1);
  }

  addChildLink (parentNodeID, childNodeID) {
    var deleted = (_private_.data.nodes[`ID${parentNodeID}`].deleted || _private_.data.nodes[`ID${childNodeID}`].deleted);

    delete _private_.data.rootNodes[`ID${childNodeID}`];

    if (this.isLinked(parentNodeID, childNodeID, 'child')) {
      return false;
    } else {
      _private_.data.nodes[`ID${parentNodeID}`].links.push(
        { toID: childNodeID, type: 'child', tags: [], deleted: deleted }
      );
      _private_.data.nodes[`ID${childNodeID}`].links.push(
        { toID: parentNodeID, type: 'parent', tags: [], deleted: deleted }
      );

      return true;
    }
  }

  addParentLink (childNodeID, parentNodeID) {
    if (this.isLinked(parentNodeID, childNodeID, 'parent')) {
      return false;
    } else {
      this.addChildLink(parentNodeID, childNodeID);

      return true;
    }
  }

  addFriendLink (nodeID1, nodeID2) {
    var deleted = (_private_.data.nodes[`ID${nodeID1}`].deleted || _private_.data.nodes[`ID${nodeID2}`].deleted);

    if (this.isLinked(nodeID1, nodeID2, 'friend')) {
      return false;
    } else {
      _private_.data.nodes[`ID${nodeID1}`].links.push(
        { toID: nodeID2, type: 'friend', tags: [], deleted: deleted }
      );
      _private_.data.nodes[`ID${nodeID2}`].links.push(
        { toID: nodeID1, type: 'friend', tags: [], deleted: deleted }
      );

      return true;
    }
  }

  addLink (nodeID1, nodeID2, type) {
    switch (type) {
      case 'child':
        return this.addChildLink(nodeID1, nodeID2);
        break;
      case 'parent':
        return this.addParentLink(nodeID1, nodeID2);
        break;
      case 'friend':
        return this.addFriendLink(nodeID1, nodeID2);
        break;
      default:
        return false;
    }
  }

  purgeLink (nodeID1, nodeID2, type) { // Törölt státuszút is lehet véglegesen törölni.
    var linkIndex;
    var typePair = (type === 'child') ? 'parent' : ((type === 'parent') ? 'child' : type);

    if (this.isLinked(nodeID1, nodeID2, type)) {
      linkIndex = _private_.data.nodes[`ID${nodeID1}`].links.findIndex(function (link) {
        return ((link.toID === nodeID2) && (link.type === type));
      });
      _private_.data.nodes[`ID${nodeID1}`].links.splice(linkIndex, 1);

      linkIndex = _private_.data.nodes[`ID${nodeID2}`].links.findIndex(function (link) {
        return ((link.toID === nodeID1) && (link.type === typePair));
      });
      _private_.data.nodes[`ID${nodeID2}`].links.splice(linkIndex, 1);

      switch (type) {
        case 'child':
          if (!this.hasParentLinks(nodeID2)) {
            _private_.data.rootNodes[`ID${nodeID2}`] = nodeID2;
          }
          break;
        case 'parent':
          if (!this.hasParentLinks(nodeID1)) {
            _private_.data.rootNodes[`ID${nodeID1}`] = nodeID1;
          }
          break;
      }

      return true;
    } else {
      return false;
    }
  }

  isDeleted (nodeID) {
    if (_private_.data.nodes[`ID${nodeID}`].deleted) {
      return true;
    } else {
      return false;
    }
  }

  isTagExists (tag) {
    if (_private_.data.tags[tag]) {
      return true;
    } else {
      return false;
    }
  }

  isNodeTagged (nodeID, tag) {
    return (_private_.data.nodes[`ID${nodeID}`].tags.findIndex(function (elmement) {
      return (element === tag);
    }) > -1);
  }

  addNodeTag (nodeID, tag) {
    if (!this.isTagExists(tag)) {
      _private_.data.tags[tag] = tag;
    }

    if (this.isNodeTagged(nodeID, tag)) {
      return false;
    } else {
      _private_.data.nodes[`ID${nodeID}`].tags.push(tag);

      return true;
    }
  }

  isLinkTagged (nodeID1, nodeID2, type, tag) {
    var linkIndex = _private_.data.nodes[`ID${nodeID1}`].links.findIndex(function (link) {
      return ((link.toID === nodeID2) && (link.type === type));
    });

    if (linkIndex > -1) {
      if (_private_.data.nodes[`ID${nodeID1}`].links[linkIndex].tags.findIndex(function (element) {
        return (element === tag);
      }
      ) > -1) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  addLinkTag (nodeID1, nodeID2, type, tag) {
    var linkIndex;
    var typePair = (type === 'child') ? 'parent' : ((type === 'parent') ? 'child' : type);

    if (!this.isLinked(nodeID1, nodeID2, type)) {
      return false;
    }

    if (this.isLinkTagged(nodeID1, nodeID2, type, tag)) {
      return false;
    }

    if (!this.isTagExists(tag)) {
      _private_.data.tags[tag] = tag;
    }

    linkIndex = _private_.data.nodes[`ID${nodeID1}`].links.findIndex(function (link) {
      return ((link.toID === nodeID2) && (link.type === type));
    });
    _private_.data.nodes[`ID${nodeID1}`].links[linkIndex].tags.push(tag);

    linkIndex = _private_.data.nodes[`ID${nodeID2}`].links.findIndex(function (link) {
      return ((link.toID === nodeID1) && (link.type === typePair));
    });
    _private_.data.nodes[`ID${nodeID2}`].links[linkIndex].tags.push(tag);

    return true;
  }

  getLinks (nodeID) {
    return _private_.data.nodes[`ID${nodeID}`].links.filter(function (link) {
      return (link.deleted === false);
    });
  }

  getChildLinks (nodeID) {
    return _private_.data.nodes[`ID${nodeID}`].links.filter(function (link) {
      return (link.type === 'child' && link.deleted === false);
    });
  }

  hasChildLinks (nodeID) {
    return (this.getChildLinks(nodeID).length > 0);
  }

  getParentLinks (nodeID) {
    return _private_.data.nodes[`ID${nodeID}`].links.filter(function (link) {
      return (link.type === 'parent' && link.deleted === false);
    });
  }

  hasParentLinks (nodeID) {
    return (this.getParentLinks(nodeID).length > 0);
  }

  getFriendLinks (nodeID) {
    return _private_.data.nodes[`ID${nodeID}`].links.filter(function (link) {
      return (link.type === 'friend' && link.deleted === false);
    });
  }

  hasFriendLinks (nodeID) {
    // log.DEBUG(`nodeID(${nodeID}).hasFriendLinks() = ${(this.getFriendLinks(nodeID).length > 0)}`);
    return (this.getFriendLinks(nodeID).length > 0);
  }

  getNode (nodeID) {
    return (_private_.data.nodes[`ID${nodeID}`]);
  }

  searchNodesByText (searchText) {
    var _this = this;

    var keys = Object.keys(_private_.data.nodes).filter(function (nodeKey) {
      // majd figyelni kell, h a deleted-ek ne szerepeljenek a listában.
      return ((!__private_.data.nodes[nodeKey].deleted) && (__private_.data.nodes[nodeKey].text.toLowerCase().indexOf(searchText.toLowerCase()) !== -1));
    });
    var result = [];
    for (var i in keys) {
      result.push({
        id: __private_.data.nodes[keys[i]].ID,
        text: __private_.data.nodes[keys[i]].text
      });
    }

    return result;
  }

  _setNodePluginData (pluginName, nodeID, data) {
    _private_.data.pluginData[pluginName].nodes[`ID${nodeID}`] = data;
  }

  _getNodePluginData (pluginName, nodeID) {
    return _private_.data.pluginData[pluginName].nodes[`ID${nodeID}`];
  }
}

export { dataset };
