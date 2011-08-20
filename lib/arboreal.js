
function include (array, item) {
  return array.indexOf(item) > -1;
}



/*
 * Privates.. 
 *
 */


function _traverseDown (context, iterator) {
  var doContinue = true;

  (function walkDown (node) {
    var i, newContext;

    if (!doContinue) return;

    if (iterator(node) === false) {
      /* break the traversal loop if the iterator returns a falsy value */
      doContinue = false;
    }
    else {
      for (i = 0; i < node.children.length; i++) {
        newContext = node.children[i];
        walkDown(newContext);
      }
    }

  })(context);

}


function _traverseUp (context, iterator) {
  var i, node, doContinue;

  while (context) {
    if ( iterator(context) === false ) return;

    for (i = 0; i < context.children.length; i++) {
      node = context.children[i];
      if ( iterator(node) === false ) return;
    }
    context = context.parent;
  }
}


function _traverse (context, iterator, callback) {
  var visited = [],
      callIterator = function (node) {
        var id = node.id,
            returned;

        if (! include(visited, id)) {
          returned = iterator.call(node, node);
          visited.push(id);

          if (returned === false) {
            return returned;
          }
        }
      },
      i, node;

  callback(context, callIterator);
}



function _removeChild (node) {
  var parent = node.parent, 
      child,
      i;

  for (i = 0; i < parent.children.length; i++) {
    child = parent.children[i];

    if (child === node) {
      return parent.children.splice(i, 1).shift();
    }
  }
}



/*
 * Autoassigns a numeric id to a node.
 *
 * parent - The parent tree node, an instance of arboreal.
 *
 * returns a numeric id.
 */

function nodeId (parent, separator) {
  separator = separator || '/';
  if (parent) {
    return [parent.id, parent.children.length ].join(separator);
  }
  else {
    return '0';
  }
}



/**
 * Constructs a tree node. 
 * 
 * parent - The parent node (optional).
 * data   - An object containing arbitrary node data (optional).
 * id     - An arbitrary id, overrides the auto-assigned one (optional).
 * 
 * Returns itself.
 * 
 */

function Arboreal (parent, data, id) {
  this.depth = parent ? parent.depth + 1 : 0;
  this.data = data || {};
  this.parent = parent || null;
  this.id = id || nodeId(parent);
  this.children = [];
  
  return this;
}

Arboreal.parse = function (object, childrenAttr) {
  var root,
      getNodeData = function (node) {
        var attr, nodeData = {};
        for (attr in node) {
          if (attr !== childrenAttr) nodeData[attr] = node[attr];
        }
        return nodeData;
      };

  (function walkDown(node, parent) {
    var newNode, i;

    if (!parent) {
      newNode = root = new Arboreal(null, getNodeData(node));
    } else {
      newNode = new Arboreal(parent, getNodeData(node));
      parent.children.push(newNode);
    }
    if (childrenAttr in node) {
      for (i = 0; i < node[childrenAttr].length; i++ ) {
        walkDown(node[childrenAttr][i], newNode);
      }
    }
  })(object, null);

  return root;

};

/**
 * Appends a child to a tree node.
 * 
 * 
 * id - The arbitrary id for the child node (overrides the auto-assigned one, optional).
 * data - An object contaning arbitrary node data.
 * 
 * 
 * returns itself.
 * 
 */

Arboreal.prototype.appendChild = function (data, id) {
  var child = new Arboreal(this, data, id);
  this.children.push(child);
  return this;
};


/**
 * Removes a child node from the tree.
 * 
 * node - A numerical node index (e.g.), or a node instance.
 * 
 * Returns the removed node.
 * 
 */

Arboreal.prototype.removeChild = function (arg) {
  if (typeof arg === 'number' && this.children[arg]) {
    return this.children.splice(arg, 1).shift();
  }

  if (arg instanceof Arboreal) {
    return _removeChild(arg);
  }

  throw Error("Invalid argument "+ arg);
};


/**
 * Removes the current node from the tree
 * 
 */

Arboreal.prototype.remove = function () {
  return _removeChild(this);
};


/**
 * Walks the tree up to its root 
 * 
 * returns the tree's root node.
 * 
 */

Arboreal.prototype.root = function () {
  var node = this;

  if (!node.parent) {
    return this;
  }

  while (node.parent) {
    node = parent.parent;
  }
  return node;
};


/**
 * Tests whether a node is the tree's root. 
 * 
 * returns a boolean.
 * 
 */

Arboreal.prototype.isRoot = function () {
  return !this.parent;
};


/**
 * Traverses a tree upwards (including the starting node's children)
 * 
 * iterator - a callback function (receives the currently traversed node as only argument, stops the traversal if returns a falsy value).
 * 
 * returns nothing.
 * 
 */



Arboreal.prototype.traverseUp = function (iterator) {
  _traverse(this, iterator, _traverseUp);
};


/**
 * Traverses a tree downwards.
 *  
 * iterator - a callback function (receives the currently traversed node as only argument, stops the traversal if returns a falsy value).
 * 
 * returns nothing.
 * 
 */

Arboreal.prototype.traverseDown = function (iterator) {
  _traverse(this, iterator, _traverseDown);
};

Arboreal.prototype.toString = function () {
  var lines = [];

  this.traverseDown(function (node) {
    var separator = '|- ', indentation = '',  i;

    if (node.depth === 0) {
      lines.push(node.id);
      return;
    }
    for (i = 0; i < node.depth; i++) {
      indentation += ' ';
    }
    lines.push( indentation + separator + node.id);
  });
  return lines.join("\n");
};

Arboreal.prototype.find = function (finder) {
  var match = null;
      iterator = (typeof finder === 'function') ?
        finder : function (node) {
          if (node.id === finder) {
            match = node;
            return false;
          }
        };

  this.traverseDown(function (node) {
    if (iterator.call(this, node)) {
      match = node;
      return false;
    }
  });

  return match;
};

Arboreal.prototype.path = function (path, separator) {
  separator = separator || '/';
  //allow path to begin with 
  if (path[0] === separator) path = path.substring(1);

  var indexes = path.split(separator),
      index = null,
      context = this,
      i;

  for (i = 0; i < indexes.length; i++) {
    index = parseInt(indexes[i], 10);
    context = (context.children.length && context.children.length > index) ? 
      context.children[index] : null;
  }

  return context;
};


/**
 * Flattens a tree (or a portion of it) into an array.
 * 
 * Returns a one dimensional array containing the current node and all its descendants.
 * 
 */

Arboreal.prototype.toArray = function () {
  var nodeList = [];
  this.traverseDown(function (node) {
    nodeList.push(node);
  });
  return nodeList;
};

Arboreal.prototype.__defineGetter__("length", function () {
  return this.toArray().length;
});

module.exports = Arboreal;
