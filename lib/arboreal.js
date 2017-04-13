/**
 * @file Arboreal.js
 * @author Vasiliy Altunin <skyr@altunin.online>
 * @copyright 2017 Vasiliy Altunin
 * @version 0.0.1
 * @license MIT
 * @description Javascript tree traversal and manipulation library (Forked from Nenad V. Nikolić, originally by Andrea Fiore)
 * @module arboreal
 */

(function () {

    /**
     * @private
     * @param {type} array
     * @param {type} item
     * @returns {Number|arboreal_L8.indexOf.i}
     */
    function indexOf(array, item) {
        for (var i = 0, j = array.length; i < j; i++) {
            if (array[i] === item) {
                return i;
            }
        }
        return -1;
    }

    /**
     * @private
     * @param {type} array
     * @param {type} item
     * @returns {Boolean}
     */
    function include(array, item) {
        return indexOf(array, item) > -1;
    }

    /**
     * Traverse down tree iterator
     * @private
     * @param {type} context  
     * @param {function} iterator Iterator function to be called when traverse node
     * @param {function} iteratorAfter Optional iterator function to be called AFTER node was traversed
     */
    function _traverseDown(context, iterator, iteratorAfter) {
        var doContinue = true;

        (function walkDown(node) {
            var i, newContext;

            if (!doContinue) {
                return;
            }

            if (iterator(node) === false) {
                //break the traversal loop if the iterator returns a falsy value
                doContinue = false;
            } else {
                for (i = 0; i < node.children.length; i++) {
                    newContext = node.children[i];
                    walkDown(newContext);
                    if (iteratorAfter !== undefined)
                    {
                        iteratorAfter.call(newContext, newContext);
                    }
                }
            }
        })(context);
    }

    /**
     * Traverse up tree iterator
     * @private
     * @param {type} context
     * @param {function} iterator Iterator function to be called when traverse node
     */
    function _traverseUp(context, iterator) {
        var i, node;

        while (context) {
            if (iterator(context) === false) {
                return;
            }

            for (i = 0; i < context.children.length; i++) {
                node = context.children[i];
                if (iterator(node) === false) {
                    return;
                }
            }
            context = context.parent;
        }
    }

    /**
     * Bubble up tree iterator
     * @private
     * @param {type} context
     * @param {function} iterator Iterator function to be called when traverse node     * 
     */
    function _bubbleUp(context, iterator) {

        while (context) {
            if (iterator(context) === false) {
                return;
            }
            context = context.parent;
        }
    }

    /**
     * Traverse node and calls callback
     * @private
     * @param {type} context
     * @param {type} iterator Iterator function to be called when traverse node
     * @param {type} callback Iterator callback
     * @param {type} iteratorAfter Optional iterator function to be called AFTER node was traversed
     */
    function _traverse(context, iterator, callback, iteratorAfter) {
        var visited = [],
                callIterator = function (node) {
                    var id = node.id,
                            returned;

                    if (!include(visited, id)) {
                        returned = iterator.call(node, node);
                        visited.push(id);

                        if (returned === false) {
                            return returned;
                        }
                    }
                };
        // ,i, node;

        callback(context, callIterator, iteratorAfter);
    }


    /**
     * Removes node 
     * @private
     * @param {node} node
     * @returns {Arboreal}
     */
    function _removeChild(node) {
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

    /**
     * Build Id for node by concat parent node id with separator and parent children length
     * @private
     * @param {Node} parent Parent node 
     * @param {Char} Separator for numbers in Id
     * @returns {String} Id string
     */
    function _nodeId(parent, separator) {
        separator = separator || '/';
        if (parent) {
            return [parent.id, parent.children.length].join(separator);
        } else {
            return '0';
        }
    }

    /**
     * Creates Arboreal root tree object or child node object
     * @param {Arboreal=} parent Parent node 
     * @param {Object=} data Data to store in node
     * @param {String=} id - node id
     * @param {Char=} separator - separator for id numbers
     * @memberOf module:arboreal
     * @example      * 
     * var tree = new Arboreal(null,{category: 'JavaScript'});
     * console.log(tree.toString(true));
     * 
     * Result:
     * 
     * 0 {"category":"JavaScript"}
     * @returns {Arboreal} Arboreal object
     */
    function Arboreal(parent, data, id, separator) {
        this.depth = parent ? parent.depth + 1 : 0;
        this.data = data || {};
        this.parent = parent || null;

        if (separator === undefined)
        {
            if ((parent !== undefined) && (parent !== null))
            {
                this.separator = this.parent.separator;
            } else
            {
                this.separator = '/';
            }
        } else
        {
            this.separator = separator;
        }
        this.id = id || _nodeId(parent, this.separator);
        this.children = [];
    }

    /**
     * Parses Object and creates tree from it
     * @param {Object} object Object to parse
     * @param {String} childrenAttr - name of object attr to use as children attr
     * @param {Arboreal} parent - Parent node, if null new tree created
     * @memberOf module:arboreal
     * @example 
     * var wikipediaJsCategory = {
     *     category: 'JavaScript',
     *     subcategories: [
     *          {category: 'Ajax (programming)'},
     *          {category: 'JavaScript engines'},
     *          {category: 'JavaScript programming languages family',
     *              subcategories: [{
     *                  category: 'JavaScript dialect engines'
     *              }]
     *           },
     *           {category: 'JavaScript based calendar components'},
     *           {category: 'JavaScript based HTML editors'}
     *     ]
     * };
     * tree = Arboreal.parse(wikipediaJsCategory, 'subcategories');
     * 
     * Result:
     * 
     * 0 {"category":"JavaScript"}
     *  |- 0/0 {"category":"Ajax (programming)"}
     *  |- 0/1 {"category":"JavaScript engines"}
     *  |- 0/2 {"category":"JavaScript programming languages family"}
     *  |- 0/2/0  {"category":"JavaScript dialect engines"}
     *  |- 0/3 {"category":"JavaScript based calendar components"}
     *  |- 0/4 {"category":"JavaScript based HTML editors"}
     * @returns {Arboreal} Arboreal root object or parent object
     */
    Arboreal.parse = function (object, childrenAttr, parent) {
        var root, getNodeData = function (node) {
            var attr, nodeData = {};
            for (attr in node) {
                if (attr !== childrenAttr) {
                    nodeData[attr] = node[attr];
                }
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
                for (i = 0; i < node[childrenAttr].length; i++) {
                    walkDown(node[childrenAttr][i], newNode);
                }
            }
        })(object, parent);

        return root || parent;

    };

    /**
     * Appends child node to tree
     * @param {Object} data Data to store in node
     * @param {String=} id - Node id
     * @memberOf module:arboreal
     * @example
     * var tree = new Arboreal(null,{category: 'JavaScript'});
     * tree.appendChild({category: 'Ajax (programming)'});
     * 
     * Result
     * 
     * 0 {"category":"JavaScript"}
     *  |- 0/0 {"category":"Ajax (programming)"}
     * @returns {Arboreal} Arboreal root object or parent object
     */
    Arboreal.prototype.appendChild = function (data, id) {
        var child = new Arboreal(this, data, id);
        this.children.push(child);
        return this;
    };
    /**
     * Parse data and add it to `this` node
     * @param {Object} data Object to be parsed
     * @param {String} childrenAttr Attr to use as children attr
     * @memberOf module:arboreal
     * @example 
     * 
     * var wikipediaJsCategory = {
     *     category: 'JavaScript',
     *     subcategories: [
     *          {category: 'Ajax (programming)'},
     *          {category: 'JavaScript engines'},
     *          {category: 'JavaScript programming languages family',
     *              subcategories: [{
     *                  category: 'JavaScript dialect engines'
     *              }]
     *           },
     *           {category: 'JavaScript based calendar components'},
     *           {category: 'JavaScript based HTML editors'}
     *     ]
     * };
     * 
     * tree = Arboreal.parse(wikipediaJsCategory, 'subcategories');
     * 
     * var subCategory = {
     * category: 'JavaScript ajax query',
     * subcategories: [
     *     {category: 'JSON'},
     *     {category: 'jQuery'}
     * ]};
     * 
     * tree.children[0].appendChildren(subCategory, 'subcategories');
     * 
     * console.log(tree.toString(true));
     * 
     * Result:
     * 
     * 0 {"category":"JavaScript"}
     *  |- 0/0 {"category":"Ajax (programming)"}
     *   |- 0/0/0  {"category":"JavaScript ajax query"}
     *    |- 0/0/0/0   {"category":"JSON"}
     *    |- 0/0/0/1   {"category":"jQuery"}
     *  |- 0/1 {"category":"JavaScript engines"}
     *  |- 0/2 {"category":"JavaScript programming languages family"}
     *   |- 0/2/0  {"category":"JavaScript dialect engines"}
     *  |- 0/3 {"category":"JavaScript based calendar components"}
     *  |- 0/4 {"category":"JavaScript based HTML editors"}     
     * @returns {Arboreal} Arboreal root object or parent object
     */
    Arboreal.prototype.appendChildren = function (data, childrenAttr) {
        return Arboreal.parse(data, childrenAttr, this);
    };

    /**
     * Remove child node from `this` node
     * @param {String= | Node=} arg Node id or Arboreal
     * @memberOf module:arboreal
     * @example 
     * 
     * var wikipediaJsCategory = {
     *     category: 'JavaScript',
     *     subcategories: [
     *          {category: 'Ajax (programming)'},
     *          {category: 'JavaScript engines'},
     *          {category: 'JavaScript programming languages family',
     *              subcategories: [{
     *                  category: 'JavaScript dialect engines'
     *              }]
     *           },
     *           {category: 'JavaScript based calendar components'},
     *           {category: 'JavaScript based HTML editors'}
     *     ]
     * };
     * 
     * tree.removeChild(2);
     * 
     * console.log(tree.toString(true));
     * 
     * Result:
     * 
     * 0 {"category":"JavaScript"}
     *  |- 0/0 {"category":"Ajax (programming)"}
     *  |- 0/1 {"category":"JavaScript engines"}
     *  |- 0/3 {"category":"JavaScript based calendar components"}
     *  |- 0/4 {"category":"JavaScript based HTML editors"}     
     * @returns {Arboreal} Arboreal
     */
    Arboreal.prototype.removeChild = function (arg) {
        if (typeof arg === 'number' && this.children[arg]) {
            return this.children.splice(arg, 1).shift();
        }
        if (arg instanceof Arboreal) {
            return _removeChild(arg);
        }
        throw new Error("Invalid argument " + arg);
    };

    /**
     * Removes `this` node
     * @memberOf module:arboreal
     * @example
     * var wikipediaJsCategory = {
     *     category: 'JavaScript',
     *     subcategories: [
     *          {category: 'Ajax (programming)'},
     *          {category: 'JavaScript engines'},
     *          {category: 'JavaScript programming languages family',
     *              subcategories: [{
     *                  category: 'JavaScript dialect engines'
     *              }]
     *           },
     *           {category: 'JavaScript based calendar components'},
     *           {category: 'JavaScript based HTML editors'}
     *     ]
     * };
     * 
     * tree.children[0].remove();
     * 
     * console.log(tree.toString(true));
     * 
     * Result:
     * 
     * 0 {"category":"JavaScript"}
     *  |- 0/1 {"category":"JavaScript engines"}
     *  |- 0/2 {"category":"JavaScript programming languages family"}
     *   |- 0/2/0  {"category":"JavaScript dialect engines"}
     *  |- 0/3 {"category":"JavaScript based calendar components"}
     *  |- 0/4 {"category":"JavaScript based HTML editors"}
     * @returns {Arboreal}
     */
    Arboreal.prototype.remove = function () {
        return _removeChild(this);
    };

    /**
     * Traverse tree down
     * @param {function} iterator Iterator function
     * @memberOf module:arboreal
     * @example
     * //Traverse and creating HTML list discribed in example
     * //https://vasiliyaltunin.github.io/arboreal.js/examples
     * 
     * var wikipediaJsCategory = {
     *     category: 'JavaScript',
     *     subcategories: [
     *          {category: 'Ajax (programming)'},
     *          {category: 'JavaScript engines'},
     *          {category: 'JavaScript programming languages family',
     *              subcategories: [{
     *                  category: 'JavaScript dialect engines'
     *              }]
     *           },
     *           {category: 'JavaScript based calendar components'},
     *           {category: 'JavaScript based HTML editors'}
     *     ]
     * };
     * 
     * function iterator (node) {
     *   var depth = "", i;
     *   for (i = 1; i <= node.depth; i++) depth += ">>";
     *   console.log([depth, node.data.category].join(" "));
     * }
     * 
     * tree.traverseDown(iterator);
     * 
     * Result:
     * 
     *  JavaScript  
     * >> Ajax (programming)
     * >> JavaScript engines
     * >> JavaScript programming languages family 
     * >>>> JavaScript dialect engines  
     * >> JavaScript based calendar components  
     * >> JavaScript based HTML editors
     */
    Arboreal.prototype.traverseDown = function (iterator, iteratorAfter) {
        _traverse(this, iterator, _traverseDown, iteratorAfter);
    };



    /**
     * Traverse tree up
     * @param {function} iterator Iterator function
     * @memberOf module:arboreal
     * @example 
     * var wikipediaJsCategory = {
     *     category: 'JavaScript',
     *     subcategories: [
     *          {category: 'Ajax (programming)'},
     *          {category: 'JavaScript engines'},
     *          {category: 'JavaScript programming languages family',
     *              subcategories: [{
     *                  category: 'JavaScript dialect engines'
     *              }]
     *           },
     *           {category: 'JavaScript based calendar components'},
     *           {category: 'JavaScript based HTML editors'}
     *     ]
     * };
     * 
     * function iterator (node) {
     *   var depth = "", i;
     *   for (i = 1; i <= node.depth; i++) depth += ">>";
     *   console.log([depth, node.data.category].join(" "));
     * }
     * 
     * tree.children[2].traverseUp(iterator);
     * 
     * Result:
     * 
     * >> JavaScript programming languages family
     * >>>> JavaScript dialect engines
     *  JavaScript
     * >> Ajax (programming)
     * >> JavaScript engines
     * >> JavaScript based calendar components
     * >> JavaScript based HTML editors
     */
    Arboreal.prototype.traverseUp = function (iterator) {
        _traverse(this, iterator, _traverseUp);
    };

    /**
     * Traverse tree bubble up
     * @param {function} iterator Iterator function
     * @memberOf module:arboreal
     * @example 
     * var wikipediaJsCategory = {
     *     category: 'JavaScript',
     *     subcategories: [
     *          {category: 'Ajax (programming)'},
     *          {category: 'JavaScript engines'},
     *          {category: 'JavaScript programming languages family',
     *              subcategories: [{
     *                  category: 'JavaScript dialect engines'
     *              }]
     *           },
     *           {category: 'JavaScript based calendar components'},
     *           {category: 'JavaScript based HTML editors'}
     *     ]
     * };
     * 
     * function iterator (node) {
     *   var depth = "", i;
     *   for (i = 1; i <= node.depth; i++) depth += ">>";
     *   console.log([depth, node.data.category].join(" "));
     * }
     * 
     * tree.children[2].children[0].bubbleUp(iterator);
     * 
     * Result:
     * 
     * >>>> JavaScript dialect engines
     * >> JavaScript programming languages family
      * JavaScript
     */
    Arboreal.prototype.bubbleUp = function (iterator) {
        _traverse(this, iterator, _bubbleUp);
    };

    /**
     * Retrns string representation of a tree
     * @param {boolean=} isValue If true than data value printed
     * @memberOf module:arboreal
     * @example 
     * var wikipediaJsCategory = {
     *     category: 'JavaScript',
     *     subcategories: [
     *          {category: 'Ajax (programming)'},
     *          {category: 'JavaScript engines'},
     *          {category: 'JavaScript programming languages family',
     *              subcategories: [{
     *                  category: 'JavaScript dialect engines'
     *              }]
     *           },
     *           {category: 'JavaScript based calendar components'},
     *           {category: 'JavaScript based HTML editors'}
     *     ]
     * };
     * 
     * console.log(tree.toString());
     * 
     * Result: 
     * 
     * 0 
     *  |- 0/0 
     *  |- 0/1 
     *  |- 0/2 
     *   |- 0/2/0  
     *  |- 0/3 
     *  |- 0/4 
     *  
     *  If True passed as arg result changed:
     *  
     * 0 {"category":"JavaScript"}
     *  |- 0/0 {"category":"Ajax (programming)"}
     *  |- 0/1 {"category":"JavaScript engines"}
     *  |- 0/2 {"category":"JavaScript programming languages family"}
     *   |- 0/2/0  {"category":"JavaScript dialect engines"}
     *  |- 0/3 {"category":"JavaScript based calendar components"}
     *  |- 0/4 {"category":"JavaScript based HTML editors"}
     * @returns {String}
     */
    Arboreal.prototype.toString = function (isValue) {
        var lines = [];
        isValue = isValue || false;

        this.traverseDown(function (node) {
            var separator = '|- ', indentation = '', i;

            var value = "";
            if (isValue)
            {
                value = JSON.stringify(node.data);
            }

            if (node.depth === 0) {
                lines.push(node.id + " " + value);
                return;
            }
            for (i = 0; i < node.depth; i++) {
                indentation += ' ';
            }

            lines.push(indentation + separator + node.id + indentation + value);
        });
        return lines.join("\n");
    };

    /**
     * Finds node in tree by using iterator
     * @param {function} finder Iterator
     * @memberOf module:arboreal
     * @example 
     * var wikipediaJsCategory = {
     *     category: 'JavaScript',
     *     subcategories: [
     *          {category: 'Ajax (programming)'},
     *          {category: 'JavaScript engines'},
     *          {category: 'JavaScript programming languages family',
     *              subcategories: [{
     *                  category: 'JavaScript dialect engines'
     *              }]
     *           },
     *           {category: 'JavaScript based calendar components'},
     *           {category: 'JavaScript based HTML editors'}
     *     ]
     * };
     * 
     * var result = tree.find(function (node) {
     *   return (/calendar/).test(node.data.category)
     * }).data.category;
     * console.log(result);
     * 
     * Result:
     * 
     * JavaScript based calendar components
     * @returns {Arboreal} First match
     */

    Arboreal.prototype.find = function (finder) {
        var match = null,
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

    /**
     * Returns Arboreal for givent id path
     * @param {String} path Id string 
     * @param {Char=} separator Separator to use
     * @memberOf module:arboreal
     * @example 
     * var wikipediaJsCategory = {
     *     category: 'JavaScript',
     *     subcategories: [
     *          {category: 'Ajax (programming)'},
     *          {category: 'JavaScript engines'},
     *          {category: 'JavaScript programming languages family',
     *              subcategories: [{
     *                  category: 'JavaScript dialect engines'
     *              }]
     *           },
     *           {category: 'JavaScript based calendar components'},
     *           {category: 'JavaScript based HTML editors'}
     *     ]
     * };
     * 
     * var result = tree.path("/2/0").data.category;
     * console.log(result);
     * 
     * Result:
     * 
     * JavaScript dialect engines
     * @returns {Arboreal} Node finded by path
     */
    Arboreal.prototype.path = function (path, separator) {
        separator = separator || '/';
        //allow path to begin with 
        if (path[0] === separator) {
            path = path.substring(1);
        }

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
     * Converts tree to array of objects
     * @private
     * @returns {array} Array pepresentation of tree
     */
    Arboreal.prototype.toArray = function () {
        var nodeList = [];
        this.traverseDown(function (node) {
            nodeList.push(node);
        });
        return nodeList;
    };

    /**
     * Returns root node for `this`
     * @private
     * @returns {Arboreal}
     */
    Arboreal.prototype.root = function () {
        var node = this;

        if (!node.parent) {
            return this;
        }

        while (node.parent) {
            node = node.parent;
        }
        return node;
    };

    /**
     * Checks is root
     * @private
     * @returns {Arboreal}
     */
    Arboreal.prototype.isRoot = function () {
        return !this.parent;
    };

    /**
     * @private
     */
    Object.defineProperty(Arboreal.prototype, 'length', {
        get: function () {
            return this.toArray().length;
        }
    });

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = Arboreal;
    } else {
        this.Arboreal = Arboreal;
    }

}(this));
