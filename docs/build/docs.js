(function () {
'use strict';

function isDate(obj) {
    return Object.prototype.toString.call(obj) === '[object Date]';
}

var scheduler$1 = {
    components: [],
    running: false,
    add: function (component) {
        if (~scheduler$1.components.indexOf(component))
            return;
        scheduler$1.components.push(component);
        if (!scheduler$1.running) {
            scheduler$1.running = true;
            requestAnimationFrame(scheduler$1.next);
        }
    },
    next: function () {
        var hasComponents = false;
        var i = scheduler$1.components.length;
        while (i--) {
            var component = scheduler$1.components[i];
            var data = {};
            var hasSprings = false;
            for (var key in component._springs) {
                var spring_1 = component._springs[key];
                if (spring_1(data)) {
                    hasSprings = true;
                    hasComponents = true;
                }
                else {
                    component._springCallbacks[key]();
                    delete component._springs[key];
                    delete component._springCallbacks[key];
                }
            }
            component._springing = true;
            component.set(data);
            component._springing = false;
            if (!hasSprings)
                scheduler$1.components.splice(i, 1);
        }
        if (hasComponents) {
            requestAnimationFrame(scheduler$1.next);
        }
        else {
            scheduler$1.running = false;
        }
    }
};
function snap$1(key, a, b, options) {
    return function (object) {
        object[key] = b;
        return false;
    };
}
function number(key, a, b, options) {
    var velocity = 0;
    var stiffness = options.stiffness, damping = options.damping;
    var valueThreshold = Math.abs(b - a) * 0.001;
    var velocityThreshold = valueThreshold; // TODO is this right?
    return function (object) {
        var d = b - a;
        var spring = stiffness * d;
        var damper = damping * velocity;
        var acceleration = spring - damper;
        velocity += acceleration;
        a += velocity;
        object[key] = a;
        if (velocity < velocityThreshold &&
            Math.abs(b - a) < valueThreshold) {
            object[key] = b;
            return false;
        }
        object[key] = a;
        return true;
    };
}
function date(key, a, b, options) {
    var dummy = {};
    var subspring = number(key, a.getTime(), b.getTime(), options);
    return function (object) {
        if (!subspring(dummy)) {
            object[key] = b;
            return false;
        }
        object[key] = new Date(dummy[key]);
        return true;
    };
}
function array(key, a, b, options) {
    var value = [];
    var subsprings = [];
    for (var i = 0; i < a.length; i += 1) {
        subsprings.push(getSpring(i, a[i], b[i], options));
    }
    return function (object) {
        var active = false;
        for (var i = 0; i < subsprings.length; i += 1) {
            if (subsprings[i](value))
                active = true;
        }
        if (!active) {
            object[key] = b;
            return false;
        }
        object[key] = value;
        return true;
    };
}
function object(key, a, b, options) {
    var value = {};
    var subsprings = [];
    for (var k in a) {
        subsprings.push(getSpring(k, a[k], b[k], options));
    }
    return function (object) {
        var active = false;
        for (var i = 0; i < subsprings.length; i += 1) {
            if (subsprings[i](value))
                active = true;
        }
        if (!active) {
            object[key] = b;
            return false;
        }
        object[key] = value;
        return true;
    };
}
function getSpring(key, a, b, options) {
    if (a === b || a !== a)
        return snap$1(key, a, b, options);
    var type = typeof a;
    if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
        throw new Error('Cannot interpolate values of different type');
    }
    if (Array.isArray(a)) {
        if (a.length !== b.length) {
            throw new Error('Cannot interpolate arrays of different length');
        }
        return array(key, a, b, options);
    }
    if (type === 'object') {
        if (!a || !b)
            throw new Error('Object cannot be null');
        if (isDate(a) && isDate(b)) {
            return date(key, a, b, options);
        }
        if (!keysMatch(a, b))
            throw new Error('Cannot interpolate differently-shaped objects');
        return object(key, a, b, options);
    }
    if (type === 'number') {
        return number(key, a, b, options);
    }
    throw new Error("Cannot interpolate " + type + " values");
}
function spring(key, to, options) {
    var _this = this;
    if (!this._springs) {
        this._springs = Object.create(null);
        this._springCallbacks = Object.create(null);
        this._springing = false;
        var set_1 = this.set;
        this.set = function (data) {
            if (!_this._springing) {
                for (var key_1 in data) {
                    delete _this._springs[key_1];
                }
            }
            set_1.call(_this, data);
        };
    }
    var spring = getSpring(key, this.get(key), to, options);
    this._springs[key] = spring;
    var promise = new Promise(function (fulfil) {
        _this._springCallbacks[key] = fulfil;
    });
    scheduler$1.add(this);
    return promise;
}
function keysMatch(a, b) {
    var aKeys = Object.keys(a);
    var bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length)
        return false;
    for (var i = 0; i < aKeys.length; i += 1) {
        if (!(aKeys[i] in b))
            return false;
    }
    return true;
}

function noop() {}

function assign(target) {
	var k,
		source,
		i = 1,
		len = arguments.length;
	for (; i < len; i++) {
		source = arguments[i];
		for (k in source) target[k] = source[k];
	}

	return target;
}

function appendNode(node, target) {
	target.appendChild(node);
}

function insertNode(node, target, anchor) {
	target.insertBefore(node, anchor);
}

function detachNode(node) {
	node.parentNode.removeChild(node);
}

function createElement(name) {
	return document.createElement(name);
}

function setAttribute(node, attribute, value) {
	node.setAttribute(attribute, value);
}

function setStyle(node, key, value) {
	node.style.setProperty(key, value);
}

function destroy(detach) {
	this.destroy = noop;
	this.fire('destroy');
	this.set = this.get = noop;

	if (detach !== false) this._fragment.unmount();
	this._fragment.destroy();
	this._fragment = this._state = null;
}

function differs(a, b) {
	return a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}

function dispatchObservers(component, group, changed, newState, oldState) {
	for (var key in group) {
		if (!changed[key]) continue;

		var newValue = newState[key];
		var oldValue = oldState[key];

		var callbacks = group[key];
		if (!callbacks) continue;

		for (var i = 0; i < callbacks.length; i += 1) {
			var callback = callbacks[i];
			if (callback.__calling) continue;

			callback.__calling = true;
			callback.call(component, newValue, oldValue);
			callback.__calling = false;
		}
	}
}

function get(key) {
	return key ? this._state[key] : this._state;
}

function fire(eventName, data) {
	var handlers =
		eventName in this._handlers && this._handlers[eventName].slice();
	if (!handlers) return;

	for (var i = 0; i < handlers.length; i += 1) {
		handlers[i].call(this, data);
	}
}

function observe(key, callback, options) {
	var group = options && options.defer
		? this._observers.post
		: this._observers.pre;

	(group[key] || (group[key] = [])).push(callback);

	if (!options || options.init !== false) {
		callback.__calling = true;
		callback.call(this, this._state[key]);
		callback.__calling = false;
	}

	return {
		cancel: function() {
			var index = group[key].indexOf(callback);
			if (~index) group[key].splice(index, 1);
		}
	};
}

function on(eventName, handler) {
	if (eventName === 'teardown') return this.on('destroy', handler);

	var handlers = this._handlers[eventName] || (this._handlers[eventName] = []);
	handlers.push(handler);

	return {
		cancel: function() {
			var index = handlers.indexOf(handler);
			if (~index) handlers.splice(index, 1);
		}
	};
}

function set(newState) {
	this._set(assign({}, newState));
	if (this._root._lock) return;
	this._root._lock = true;
	callAll(this._root._beforecreate);
	callAll(this._root._oncreate);
	callAll(this._root._aftercreate);
	this._root._lock = false;
}

function _set(newState) {
	var oldState = this._state,
		changed = {},
		dirty = false;

	for (var key in newState) {
		if (differs(newState[key], oldState[key])) changed[key] = dirty = true;
	}
	if (!dirty) return;

	this._state = assign({}, oldState, newState);
	this._recompute(changed, this._state, oldState, false);
	if (this._bind) this._bind(changed, this._state);
	dispatchObservers(this, this._observers.pre, changed, this._state, oldState);
	this._fragment.update(changed, this._state);
	dispatchObservers(this, this._observers.post, changed, this._state, oldState);
}

function callAll(fns) {
	while (fns && fns.length) fns.pop()();
}

function _mount(target, anchor) {
	this._fragment.mount(target, anchor);
}

function _unmount() {
	this._fragment.unmount();
}

var proto = {
	destroy: destroy,
	get: get,
	fire: fire,
	observe: observe,
	on: on,
	set: set,
	teardown: destroy,
	_recompute: noop,
	_set: _set,
	_mount: _mount,
	_unmount: _unmount
};

var template$1 = (function() {
const DEFAULTS = {
  opacity: 0.3,
  background: '#000000'
};
Object.freeze(DEFAULTS);

return {
  setup (Scrim) {
    Scrim.DEFAULTS = DEFAULTS;
  },

  data () {
    return Object.assign({}, DEFAULTS)
  }
}
}());

function encapsulateStyles$1(node) {
	setAttribute(node, "svelte-1216306015", "");
}

function add_css$1() {
	var style = createElement("style");
	style.id = 'svelte-1216306015-style';
	style.textContent = ".svelte-scrim[svelte-1216306015]{position:fixed;top:0;right:0;left:0;height:100vh;-webkit-tap-highlight-color:rgba(0, 0, 0, 0)}";
	appendNode(style, document.head);
}

function create_main_fragment$1(state, component) {
	var div;

	return {
		create: function() {
			div = createElement("div");
			this.hydrate();
		},

		hydrate: function(nodes) {
			encapsulateStyles$1(div);
			div.className = "svelte-scrim";
			setStyle(div, "opacity", state.opacity);
			setStyle(div, "background", state.background);
		},

		mount: function(target, anchor) {
			insertNode(div, target, anchor);
		},

		update: function(changed, state) {
			if ( changed.opacity ) {
				setStyle(div, "opacity", state.opacity);
			}

			if ( changed.background ) {
				setStyle(div, "background", state.background);
			}
		},

		unmount: function() {
			detachNode(div);
		},

		destroy: noop
	};
}

function Scrim(options) {
	this.options = options;
	this._state = assign(template$1.data(), options.data);

	this._observers = {
		pre: Object.create(null),
		post: Object.create(null)
	};

	this._handlers = Object.create(null);

	this._root = options._root || this;
	this._yield = options._yield;
	this._bind = options._bind;

	if (!document.getElementById("svelte-1216306015-style")) add_css$1();

	this._fragment = create_main_fragment$1(this._state, this);

	if (options.target) {
		this._fragment.create();
		this._fragment.mount(options.target, options.anchor || null);
	}
}

assign(Scrim.prototype, proto );

template$1.setup(Scrim);

var tabbable = function(el) {
  var basicTabbables = [];
  var orderedTabbables = [];

  // A node is "available" if
  // - it's computed style
  var isUnavailable = createIsUnavailable();

  var candidateSelectors = [
    'input',
    'select',
    'a[href]',
    'textarea',
    'button',
    '[tabindex]',
  ];

  var candidates = el.querySelectorAll(candidateSelectors);

  var candidate, candidateIndex;
  for (var i = 0, l = candidates.length; i < l; i++) {
    candidate = candidates[i];
    candidateIndex = parseInt(candidate.getAttribute('tabindex'), 10) || candidate.tabIndex;

    if (
      candidateIndex < 0
      || (candidate.tagName === 'INPUT' && candidate.type === 'hidden')
      || candidate.disabled
      || isUnavailable(candidate)
    ) {
      continue;
    }

    if (candidateIndex === 0) {
      basicTabbables.push(candidate);
    } else {
      orderedTabbables.push({
        index: i,
        tabIndex: candidateIndex,
        node: candidate,
      });
    }
  }

  var tabbableNodes = orderedTabbables
    .sort(function(a, b) {
      return a.tabIndex === b.tabIndex ? a.index - b.index : a.tabIndex - b.tabIndex;
    })
    .map(function(a) {
      return a.node
    });

  Array.prototype.push.apply(tabbableNodes, basicTabbables);

  return tabbableNodes;
};

function createIsUnavailable() {
  // Node cache must be refreshed on every check, in case
  // the content of the element has changed
  var isOffCache = [];

  // "off" means `display: none;`, as opposed to "hidden",
  // which means `visibility: hidden;`. getComputedStyle
  // accurately reflects visiblity in context but not
  // "off" state, so we need to recursively check parents.

  function isOff(node, nodeComputedStyle) {
    if (node === document.documentElement) return false;

    // Find the cached node (Array.prototype.find not available in IE9)
    for (var i = 0, length = isOffCache.length; i < length; i++) {
      if (isOffCache[i][0] === node) return isOffCache[i][1];
    }

    nodeComputedStyle = nodeComputedStyle || window.getComputedStyle(node);

    var result = false;

    if (nodeComputedStyle.display === 'none') {
      result = true;
    } else if (node.parentNode) {
      result = isOff(node.parentNode);
    }

    isOffCache.push([node, result]);

    return result;
  }

  return function isUnavailable(node) {
    if (node === document.documentElement) return false;

    var computedStyle = window.getComputedStyle(node);

    if (isOff(node, computedStyle)) return true;

    return computedStyle.visibility === 'hidden';
  }
}

var listeningFocusTrap = null;

function focusTrap(element, userOptions) {
  var tabbableNodes = [];
  var nodeFocusedBeforeActivation = null;
  var active = false;
  var paused = false;

  var container = (typeof element === 'string')
    ? document.querySelector(element)
    : element;

  var config = userOptions || {};
  config.returnFocusOnDeactivate = (userOptions && userOptions.returnFocusOnDeactivate !== undefined)
    ? userOptions.returnFocusOnDeactivate
    : true;
  config.escapeDeactivates = (userOptions && userOptions.escapeDeactivates !== undefined)
    ? userOptions.escapeDeactivates
    : true;

  var trap = {
    activate: activate,
    deactivate: deactivate,
    pause: pause,
    unpause: unpause,
  };

  return trap;

  function activate(activateOptions) {
    if (active) return;

    var defaultedActivateOptions = {
      onActivate: (activateOptions && activateOptions.onActivate !== undefined)
        ? activateOptions.onActivate
        : config.onActivate,
    };

    active = true;
    paused = false;
    nodeFocusedBeforeActivation = document.activeElement;

    if (defaultedActivateOptions.onActivate) {
      defaultedActivateOptions.onActivate();
    }

    addListeners();
    return trap;
  }

  function deactivate(deactivateOptions) {
    if (!active) return;

    var defaultedDeactivateOptions = {
      returnFocus: (deactivateOptions && deactivateOptions.returnFocus !== undefined)
        ? deactivateOptions.returnFocus
        : config.returnFocusOnDeactivate,
      onDeactivate: (deactivateOptions && deactivateOptions.onDeactivate !== undefined)
        ? deactivateOptions.onDeactivate
        : config.onDeactivate,
    };

    removeListeners();

    if (defaultedDeactivateOptions.onDeactivate) {
      defaultedDeactivateOptions.onDeactivate();
    }

    if (defaultedDeactivateOptions.returnFocus) {
      setTimeout(function () {
        tryFocus(nodeFocusedBeforeActivation);
      }, 0);
    }

    active = false;
    paused = false;
    return this;
  }

  function pause() {
    if (paused || !active) return;
    paused = true;
    removeListeners();
  }

  function unpause() {
    if (!paused || !active) return;
    paused = false;
    addListeners();
  }

  function addListeners() {
    if (!active) return;

    // There can be only one listening focus trap at a time
    if (listeningFocusTrap) {
      listeningFocusTrap.pause();
    }
    listeningFocusTrap = trap;

    updateTabbableNodes();
    tryFocus(firstFocusNode());
    document.addEventListener('focus', checkFocus, true);
    document.addEventListener('click', checkClick, true);
    document.addEventListener('mousedown', checkPointerDown, true);
    document.addEventListener('touchstart', checkPointerDown, true);
    document.addEventListener('keydown', checkKey, true);

    return trap;
  }

  function removeListeners() {
    if (!active || listeningFocusTrap !== trap) return;

    document.removeEventListener('focus', checkFocus, true);
    document.removeEventListener('click', checkClick, true);
    document.removeEventListener('mousedown', checkPointerDown, true);
    document.removeEventListener('touchstart', checkPointerDown, true);
    document.removeEventListener('keydown', checkKey, true);

    listeningFocusTrap = null;

    return trap;
  }

  function getNodeForOption(optionName) {
    var optionValue = config[optionName];
    var node = optionValue;
    if (!optionValue) {
      return null;
    }
    if (typeof optionValue === 'string') {
      node = document.querySelector(optionValue);
      if (!node) {
        throw new Error('`' + optionName + '` refers to no known node');
      }
    }
    if (typeof optionValue === 'function') {
      node = optionValue();
      if (!node) {
        throw new Error('`' + optionName + '` did not return a node');
      }
    }
    return node;
  }

  function firstFocusNode() {
    var node;
    if (getNodeForOption('initialFocus') !== null) {
      node = getNodeForOption('initialFocus');
    } else if (container.contains(document.activeElement)) {
      node = document.activeElement;
    } else {
      node = tabbableNodes[0] || getNodeForOption('fallbackFocus');
    }

    if (!node) {
      throw new Error('You can\'t have a focus-trap without at least one focusable element');
    }

    return node;
  }

  // This needs to be done on mousedown and touchstart instead of click
  // so that it precedes the focus event
  function checkPointerDown(e) {
    if (config.clickOutsideDeactivates && !container.contains(e.target)) {
      deactivate({ returnFocus: false });
    }
  }

  function checkClick(e) {
    if (config.clickOutsideDeactivates) return;
    if (container.contains(e.target)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
  }

  function checkFocus(e) {
    if (container.contains(e.target)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    // Checking for a blur method here resolves a Firefox issue (#15)
    if (typeof e.target.blur === 'function') e.target.blur();
  }

  function checkKey(e) {
    if (e.key === 'Tab' || e.keyCode === 9) {
      handleTab(e);
    }

    if (config.escapeDeactivates !== false && isEscapeEvent(e)) {
      deactivate();
    }
  }

  function handleTab(e) {
    e.preventDefault();
    updateTabbableNodes();
    var currentFocusIndex = tabbableNodes.indexOf(e.target);
    var lastTabbableNode = tabbableNodes[tabbableNodes.length - 1];
    var firstTabbableNode = tabbableNodes[0];

    if (e.shiftKey) {
      if (e.target === firstTabbableNode || tabbableNodes.indexOf(e.target) === -1) {
        return tryFocus(lastTabbableNode);
      }
      return tryFocus(tabbableNodes[currentFocusIndex - 1]);
    }

    if (e.target === lastTabbableNode) return tryFocus(firstTabbableNode);

    tryFocus(tabbableNodes[currentFocusIndex + 1]);
  }

  function updateTabbableNodes() {
    tabbableNodes = tabbable(container);
  }
}

function isEscapeEvent(e) {
  return e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27;
}

function tryFocus(node) {
  if (!node || !node.focus) return;
  node.focus();
  if (node.tagName.toLowerCase() === 'input') {
    node.select();
  }
}

var focusTrap_1$1 = focusTrap;

const activeModals = [];

const makeModalStackable = modal => {
  modal.on('opening', () => {
    activeModals.forEach(modal => modal.background());
    modal.foreground();
    activeModals.push(modal);
    const deactivate = () => {
      hiddenListener.cancel();
      destroyListener.cancel();
      activeModals.pop();
      const nextModal = activeModals[activeModals.length - 1];
      // without setTimeout, the esc key event that dismisses a modal will also dismiss the next one
      nextModal && setTimeout(() => nextModal.foreground());
    };
    const hiddenListener = modal.on(modal.constructor.FIRES.hiding, deactivate);
    const destroyListener = modal.on('destroy', deactivate);
  });
};

function noop$1() {}

function assign$1(target) {
	var k,
		source,
		i = 1,
		len = arguments.length;
	for (; i < len; i++) {
		source = arguments[i];
		for (k in source) target[k] = source[k];
	}

	return target;
}

function appendNode$1(node, target) {
	target.appendChild(node);
}

function insertNode$1(node, target, anchor) {
	target.insertBefore(node, anchor);
}

function detachNode$1(node) {
	node.parentNode.removeChild(node);
}

function reinsertChildren(parent, target) {
	while (parent.firstChild) target.appendChild(parent.firstChild);
}

function createElement$1(name) {
	return document.createElement(name);
}

function createText(data) {
	return document.createTextNode(data);
}

function addListener(node, event, handler) {
	node.addEventListener(event, handler, false);
}

function removeListener(node, event, handler) {
	node.removeEventListener(event, handler, false);
}

function setAttribute$1(node, attribute, value) {
	node.setAttribute(attribute, value);
}

function setStyle$1(node, key, value) {
	node.style.setProperty(key, value);
}

function destroy$1(detach) {
	this.destroy = noop$1;
	this.fire('destroy');
	this.set = this.get = noop$1;

	if (detach !== false) this._fragment.unmount();
	this._fragment.destroy();
	this._fragment = this._state = null;
}

function differs$1(a, b) {
	return a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}

function dispatchObservers$1(component, group, changed, newState, oldState) {
	for (var key in group) {
		if (!changed[key]) continue;

		var newValue = newState[key];
		var oldValue = oldState[key];

		var callbacks = group[key];
		if (!callbacks) continue;

		for (var i = 0; i < callbacks.length; i += 1) {
			var callback = callbacks[i];
			if (callback.__calling) continue;

			callback.__calling = true;
			callback.call(component, newValue, oldValue);
			callback.__calling = false;
		}
	}
}

function get$1(key) {
	return key ? this._state[key] : this._state;
}

function fire$1(eventName, data) {
	var handlers =
		eventName in this._handlers && this._handlers[eventName].slice();
	if (!handlers) return;

	for (var i = 0; i < handlers.length; i += 1) {
		handlers[i].call(this, data);
	}
}

function observe$1(key, callback, options) {
	var group = options && options.defer
		? this._observers.post
		: this._observers.pre;

	(group[key] || (group[key] = [])).push(callback);

	if (!options || options.init !== false) {
		callback.__calling = true;
		callback.call(this, this._state[key]);
		callback.__calling = false;
	}

	return {
		cancel: function() {
			var index = group[key].indexOf(callback);
			if (~index) group[key].splice(index, 1);
		}
	};
}

function on$1(eventName, handler) {
	if (eventName === 'teardown') return this.on('destroy', handler);

	var handlers = this._handlers[eventName] || (this._handlers[eventName] = []);
	handlers.push(handler);

	return {
		cancel: function() {
			var index = handlers.indexOf(handler);
			if (~index) handlers.splice(index, 1);
		}
	};
}

function set$1(newState) {
	this._set(assign$1({}, newState));
	if (this._root._lock) return;
	this._root._lock = true;
	callAll$1(this._root._beforecreate);
	callAll$1(this._root._oncreate);
	callAll$1(this._root._aftercreate);
	this._root._lock = false;
}

function _set$1(newState) {
	var oldState = this._state,
		changed = {},
		dirty = false;

	for (var key in newState) {
		if (differs$1(newState[key], oldState[key])) changed[key] = dirty = true;
	}
	if (!dirty) return;

	this._state = assign$1({}, oldState, newState);
	this._recompute(changed, this._state, oldState, false);
	if (this._bind) this._bind(changed, this._state);
	dispatchObservers$1(this, this._observers.pre, changed, this._state, oldState);
	this._fragment.update(changed, this._state);
	dispatchObservers$1(this, this._observers.post, changed, this._state, oldState);
}

function callAll$1(fns) {
	while (fns && fns.length) fns.pop()();
}

function _mount$1(target, anchor) {
	this._fragment.mount(target, anchor);
}

function _unmount$1() {
	this._fragment.unmount();
}

var proto$1 = {
	destroy: destroy$1,
	get: get$1,
	fire: fire$1,
	observe: observe$1,
	on: on$1,
	set: set$1,
	teardown: destroy$1,
	_recompute: noop$1,
	_set: _set$1,
	_mount: _mount$1,
	_unmount: _unmount$1
};

var template$1$1 = (function() {
// TODO: write a smaller, less "featured" focusTrap. It really just needs to trap focus
const makeFocusTrap = ({ rootElement }) => {
  return focusTrap_1$1(rootElement, {
    initialFocus: rootElement,
    fallbackFocus: rootElement,
    escapeDeactivates: false,
    returnFocusOnDeactivate: true,
    clickOutsideDeactivates: false
  })
};

/* TODO: maybe make a way to accept custom transitions */
// which might conflict with this todo:
/* TODO: be fancy and take a touch/click/element position to transition in from */
const STYLE = {
  modal:   { open: { opacity: 1 }, hidden: { opacity: 0 } },
  content: { open: { scale: 1 },   hidden: { scale: 0.9 } }
};
const DEFAULTS = {
  initiallyHidden: false,
  initialFocusElement: false,
  center: true,
  zIndexBase: 1,
  pressScrimToDismiss: true,
  escToDismiss: true,
  trapFocus: true
};
const FIRES = {
  opening: 'opening',
  opened: 'opened',

  result: 'result',
  dismissed: 'dismissed',
  closed: 'closed',

  hiding: 'hiding',
  hidden: 'hidden'
};
const ONS = {
  open: 'open',
  dismiss: 'dismiss',
  close: 'close'
};[ STYLE, DEFAULTS, FIRES, ONS ].forEach(Object.freeze);

return {
  setup (Modal) {
    Object.assign(Modal, { DEFAULTS, FIRES, ONS });
  },

  data () {
    return Object.assign({
      hidden: true,
      hiding: false,
      opening: false,
      inForeground: false, // to handle stacking of multiple modals open at once
      modalStyle: STYLE.modal.hidden,
      contentStyle: STYLE.content.hidden
    }, DEFAULTS)
  },

  computed: {
    transitioning: (hiding, opening) => hiding || opening,
    open: (hidden, transitioning) => !hidden && !transitioning,
    zIndex: (zIndexBase, inForeground) => inForeground ? zIndexBase : zIndexBase - 1
  },

  oncreate () {
    this.on(ONS.open, () => this.open());
    this.on(ONS.dismiss, e => this.dismiss(e));
    this.on(ONS.close, e => this.close(e));

    const rootElement = this.refs.modal;

    this.focusTrap = makeFocusTrap({ rootElement });
    this.on(FIRES.hiding, () => this.focusTrap.deactivate());
    this.on('destroy', () => this.focusTrap.deactivate());

    makeModalStackable(this);

    this.on('opening', () => {

      if (this.get('trapFocus')) {
        this.focusTrap.activate();
      }
      setTimeout(() => {
        /* focusTrap seems unable to focus the element
           putting activate() in the setTimeout does not help
           Focusing it manually works just fine,
           and we need to manually focus anyway when trapFocus is false
           also, I don't think focusTrap needs to concern itself with focusing elements
        */
        this.focusInitialFocusElement();
      });
    });

    if (!this.get('initiallyHidden')) {
      this.open();
    }
  },

  methods: {
    spring (key, end, options) {
      options = options || { stiffness: 0.5, damping: 1 };
      return spring.call(this, key, end, options)
    },

    focusInitialFocusElement () {
      const initialFocusElement = this.get('initialFocusElement');
      initialFocusElement && initialFocusElement.focus();
    },

    onKeyup (event) {
      const shouldDismiss = event.key.toLowerCase() === 'escape'
        && this.get('escToDismiss')
        && this.get('inForeground');
      if (shouldDismiss) {
        this.dismiss();
      }
    },

    onScrimPress () {
      if (this.get('pressScrimToDismiss')) {
        this.dismiss();
      }
    },

    open () {
      if (this.get('open') || this.get('opening')) { return }

      this.set({ opening: true, hiding: false, hidden: false });
      this.fire(FIRES.opening);

      Promise.all([
        this.spring('modalStyle', STYLE.modal.open),
        this.spring('contentStyle', STYLE.content.open)
      ])
        .then(() => {
          this.set({ opening: false });
          this.fire(FIRES.opened);
        });

      return this
    },

    hide (reason, result) {
      if (this.get('hidden') || this.get('hiding')) { return }

      this.set({ opening: false, hiding: true });

      this.fire(FIRES.result, result);
      this.fire(reason, result);
      this.fire(FIRES.hiding);

      Promise.all([
        this.spring('modalStyle', STYLE.modal.hidden),
        this.spring('contentStyle', STYLE.content.hidden)
      ])
        .then(() => {
          this.set({ hiding: false, hidden: true });
          this.fire(FIRES.hidden);
        });

      return this
    },

    close (result) {
      return this.hide(FIRES.closed, result)
    },

    dismiss (result) {
      return this.hide(FIRES.dismissed, result)
    },

    background () {
      this.focusTrap.pause();
      this.set({ inForeground: false });
    },

    foreground (modal) {
      this.focusTrap.unpause();
      this.focusInitialFocusElement();
      this.set({ inForeground: true });
    }
  }
}
}());

function encapsulateStyles(node) {
	setAttribute$1(node, "svelte-2448038265", "");
}

function add_css() {
	var style = createElement$1("style");
	style.id = 'svelte-2448038265-style';
	style.textContent = ".svelte-modal[svelte-2448038265]{position:fixed;top:0;left:0;right:0;height:100%;display:flex;align-items:flex-start;justify-content:center}[data-center=\"true\"][svelte-2448038265]{align-items:center}[data-hidden=\"true\"][svelte-2448038265]{visibility:hidden}.content[svelte-2448038265]{max-width:100vw;max-height:100vh;overflow:visible;z-index:1}";
	appendNode$1(style, document.head);
}

function create_main_fragment$1$1(state, component) {
	var text, div, div_1, slot_content_default = component._slotted.default, text_2, div_2, slot_content_scrim = component._slotted.scrim;

	function onwindowkeyup(event) {
		var state = component.get();
		component.onKeyup(event);
	}
	window.addEventListener("keyup", onwindowkeyup);

	function click_handler(event) {
		component.onScrimPress();
	}

	var scrim = new Scrim({
		_root: component._root
	});

	return {
		create: function() {
			text = createText("\n");
			div = createElement$1("div");
			div_1 = createElement$1("div");
			text_2 = createText("\n\n  ");
			div_2 = createElement$1("div");
			if (!slot_content_scrim) {
				scrim._fragment.create();
			}
			this.hydrate();
		},

		hydrate: function(nodes) {
			encapsulateStyles(div);
			div.className = "svelte-modal";
			div.tabIndex = "-1";
			setAttribute$1(div, "data-center", state.center);
			setAttribute$1(div, "data-hidden", state.hidden);
			setStyle$1(div, "z-index", state.zIndex);
			setStyle$1(div, "opacity", state.modalStyle.opacity);
			encapsulateStyles(div_1);
			div_1.className = "content";
			setStyle$1(div_1, "transform", "scale(" + state.contentStyle.scale + ")");
			addListener(div_2, "click", click_handler);
		},

		mount: function(target, anchor) {
			insertNode$1(text, target, anchor);
			insertNode$1(div, target, anchor);
			component.refs.modal = div;
			appendNode$1(div_1, div);
			component.refs.content = div_1;

			if (slot_content_default) {
				appendNode$1(slot_content_default, div_1);
			}

			appendNode$1(text_2, div);
			appendNode$1(div_2, div);
			if (!slot_content_scrim) {
				scrim._mount(div_2, null);
			}

			if (slot_content_scrim) {
				appendNode$1(slot_content_scrim, div_2);
			}
		},

		update: function(changed, state) {
			if ( changed.center ) {
				setAttribute$1(div, "data-center", state.center);
			}

			if ( changed.hidden ) {
				setAttribute$1(div, "data-hidden", state.hidden);
			}

			if ( changed.zIndex ) {
				setStyle$1(div, "z-index", state.zIndex);
			}

			if ( changed.modalStyle ) {
				setStyle$1(div, "opacity", state.modalStyle.opacity);
			}

			if ( changed.contentStyle ) {
				setStyle$1(div_1, "transform", "scale(" + state.contentStyle.scale + ")");
			}
		},

		unmount: function() {
			detachNode$1(text);
			detachNode$1(div);

			if (slot_content_default) {
				reinsertChildren(div_1, slot_content_default);
			}

			if (slot_content_scrim) {
				reinsertChildren(div_2, slot_content_scrim);
			}
		},

		destroy: function() {
			window.removeEventListener("keyup", onwindowkeyup);

			if (component.refs.modal === div) component.refs.modal = null;
			if (component.refs.content === div_1) component.refs.content = null;
			removeListener(div_2, "click", click_handler);
			if (!slot_content_scrim) {
				scrim.destroy(false);
			}
		}
	};
}

function Modal(options) {
	this.options = options;
	this.refs = {};
	this._state = assign$1(template$1$1.data(), options.data);
	this._recompute({}, this._state, {}, true);

	this._observers = {
		pre: Object.create(null),
		post: Object.create(null)
	};

	this._handlers = Object.create(null);

	this._root = options._root || this;
	this._yield = options._yield;
	this._bind = options._bind;
	this._slotted = options.slots || {};

	if (!document.getElementById("svelte-2448038265-style")) add_css();

	var oncreate = template$1$1.oncreate.bind(this);

	if (!options._root) {
		this._oncreate = [oncreate];
		this._beforecreate = [];
		this._aftercreate = [];
	} else {
	 	this._root._oncreate.push(oncreate);
	 }

	this.slots = {};

	this._fragment = create_main_fragment$1$1(this._state, this);

	if (options.target) {
		this._fragment.create();
		this._fragment.mount(options.target, options.anchor || null);

		this._lock = true;
		callAll$1(this._beforecreate);
		callAll$1(this._oncreate);
		callAll$1(this._aftercreate);
		this._lock = false;
	}
}

assign$1(Modal.prototype, template$1$1.methods, proto$1 );

Modal.prototype._recompute = function _recompute(changed, state, oldState, isInitial) {
	if ( isInitial || changed.hiding || changed.opening ) {
		if (differs$1((state.transitioning = template$1$1.computed.transitioning(state.hiding, state.opening)), oldState.transitioning)) changed.transitioning = true;
	}

	if ( isInitial || changed.hidden || changed.transitioning ) {
		if (differs$1((state.open = template$1$1.computed.open(state.hidden, state.transitioning)), oldState.open)) changed.open = true;
	}

	if ( isInitial || changed.zIndexBase || changed.inForeground ) {
		if (differs$1((state.zIndex = template$1$1.computed.zIndex(state.zIndexBase, state.inForeground)), oldState.zIndex)) changed.zIndex = true;
	}
};

template$1$1.setup(Modal);

function noop$1$1() {}

function assign$1$1(target) {
	var k,
		source,
		i = 1,
		len = arguments.length;
	for (; i < len; i++) {
		source = arguments[i];
		for (k in source) target[k] = source[k];
	}

	return target;
}

function appendNode$1$1(node, target) {
	target.appendChild(node);
}

function insertNode$1$1(node, target, anchor) {
	target.insertBefore(node, anchor);
}

function detachNode$1$1(node) {
	node.parentNode.removeChild(node);
}

function createFragment() {
	return document.createDocumentFragment();
}

function createElement$1$1(name) {
	return document.createElement(name);
}

function createText$1(data) {
	return document.createTextNode(data);
}

function createComment() {
	return document.createComment('');
}

function addListener$1(node, event, handler) {
	node.addEventListener(event, handler, false);
}

function removeListener$1(node, event, handler) {
	node.removeEventListener(event, handler, false);
}

function setAttribute$1$1(node, attribute, value) {
	node.setAttribute(attribute, value);
}

function destroy$1$1(detach) {
	this.destroy = noop$1$1;
	this.fire('destroy');
	this.set = this.get = noop$1$1;

	if (detach !== false) this._fragment.unmount();
	this._fragment.destroy();
	this._fragment = this._state = null;
}

function differs$1$1(a, b) {
	return a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}

function dispatchObservers$1$1(component, group, changed, newState, oldState) {
	for (var key in group) {
		if (!changed[key]) continue;

		var newValue = newState[key];
		var oldValue = oldState[key];

		var callbacks = group[key];
		if (!callbacks) continue;

		for (var i = 0; i < callbacks.length; i += 1) {
			var callback = callbacks[i];
			if (callback.__calling) continue;

			callback.__calling = true;
			callback.call(component, newValue, oldValue);
			callback.__calling = false;
		}
	}
}

function get$1$1(key) {
	return key ? this._state[key] : this._state;
}

function fire$1$1(eventName, data) {
	var handlers =
		eventName in this._handlers && this._handlers[eventName].slice();
	if (!handlers) return;

	for (var i = 0; i < handlers.length; i += 1) {
		handlers[i].call(this, data);
	}
}

function observe$1$1(key, callback, options) {
	var group = options && options.defer
		? this._observers.post
		: this._observers.pre;

	(group[key] || (group[key] = [])).push(callback);

	if (!options || options.init !== false) {
		callback.__calling = true;
		callback.call(this, this._state[key]);
		callback.__calling = false;
	}

	return {
		cancel: function() {
			var index = group[key].indexOf(callback);
			if (~index) group[key].splice(index, 1);
		}
	};
}

function on$1$1(eventName, handler) {
	if (eventName === 'teardown') return this.on('destroy', handler);

	var handlers = this._handlers[eventName] || (this._handlers[eventName] = []);
	handlers.push(handler);

	return {
		cancel: function() {
			var index = handlers.indexOf(handler);
			if (~index) handlers.splice(index, 1);
		}
	};
}

function set$1$1(newState) {
	this._set(assign$1$1({}, newState));
	if (this._root._lock) return;
	this._root._lock = true;
	callAll$1$1(this._root._beforecreate);
	callAll$1$1(this._root._oncreate);
	callAll$1$1(this._root._aftercreate);
	this._root._lock = false;
}

function _set$1$1(newState) {
	var oldState = this._state,
		changed = {},
		dirty = false;

	for (var key in newState) {
		if (differs$1$1(newState[key], oldState[key])) changed[key] = dirty = true;
	}
	if (!dirty) return;

	this._state = assign$1$1({}, oldState, newState);
	this._recompute(changed, this._state, oldState, false);
	if (this._bind) this._bind(changed, this._state);
	dispatchObservers$1$1(this, this._observers.pre, changed, this._state, oldState);
	this._fragment.update(changed, this._state);
	dispatchObservers$1$1(this, this._observers.post, changed, this._state, oldState);
}

function callAll$1$1(fns) {
	while (fns && fns.length) fns.pop()();
}

function _mount$1$1(target, anchor) {
	this._fragment.mount(target, anchor);
}

function _unmount$1$1() {
	this._fragment.unmount();
}

var proto$1$1 = {
	destroy: destroy$1$1,
	get: get$1$1,
	fire: fire$1$1,
	observe: observe$1$1,
	on: on$1$1,
	set: set$1$1,
	teardown: destroy$1$1,
	_recompute: noop$1$1,
	_set: _set$1$1,
	_mount: _mount$1$1,
	_unmount: _unmount$1$1
};

var template$2 = (function() {
return {
  oncreate () {
    this.set({ initialFocusElement: this.refs.close });
  },

  methods: {
    closeModal (method, message) {
      this.fire(`modal.${method}`, message);
    }
  }
}
}());

function encapsulateStyles$1$1(node) {
	setAttribute$1$1(node, "svelte-2858857124", "");
}

function add_css$1$1() {
	var style = createElement$1$1("style");
	style.id = 'svelte-2858857124-style';
	style.textContent = ".content[svelte-2858857124]{background:white;padding:30px;border-radius:4px;margin:10px;max-height:calc(100vh - 20px);overflow-y:auto}";
	appendNode$1$1(style, document.head);
}

function create_main_fragment$2(state, component) {
	var div, p, text, text_1, p_1, text_2, text_3, button, text_4, text_5, button_1, text_6;

	function click_handler(event) {
		component.closeModal('dismiss', 'It got dismissed.');
	}

	function click_handler_1(event) {
		component.closeModal('close', `It's come to a close.`);
	}

	return {
		create: function() {
			div = createElement$1$1("div");
			p = createElement$1$1("p");
			text = createText$1("Here is some modal content.");
			text_1 = createText$1("\n  ");
			p_1 = createElement$1$1("p");
			text_2 = createText$1("It is interesting... or whatever.");
			text_3 = createText$1("\n  ");
			button = createElement$1$1("button");
			text_4 = createText$1("Dismiss Modal");
			text_5 = createText$1("\n  ");
			button_1 = createElement$1$1("button");
			text_6 = createText$1("Close Modal");
			this.hydrate();
		},

		hydrate: function(nodes) {
			encapsulateStyles$1$1(div);
			div.className = "content";
			addListener$1(button, "click", click_handler);
			addListener$1(button_1, "click", click_handler_1);
		},

		mount: function(target, anchor) {
			insertNode$1$1(div, target, anchor);
			appendNode$1$1(p, div);
			appendNode$1$1(text, p);
			appendNode$1$1(text_1, div);
			appendNode$1$1(p_1, div);
			appendNode$1$1(text_2, p_1);
			appendNode$1$1(text_3, div);
			appendNode$1$1(button, div);
			component.refs.dismiss = button;
			appendNode$1$1(text_4, button);
			appendNode$1$1(text_5, div);
			appendNode$1$1(button_1, div);
			component.refs.close = button_1;
			appendNode$1$1(text_6, button_1);
		},

		update: noop$1$1,

		unmount: function() {
			detachNode$1$1(div);
		},

		destroy: function() {
			removeListener$1(button, "click", click_handler);
			if (component.refs.dismiss === button) component.refs.dismiss = null;
			removeListener$1(button_1, "click", click_handler_1);
			if (component.refs.close === button_1) component.refs.close = null;
		}
	};
}

function ModalContent(options) {
	this.options = options;
	this.refs = {};
	this._state = options.data || {};

	this._observers = {
		pre: Object.create(null),
		post: Object.create(null)
	};

	this._handlers = Object.create(null);

	this._root = options._root || this;
	this._yield = options._yield;
	this._bind = options._bind;

	if (!document.getElementById("svelte-2858857124-style")) add_css$1$1();

	var oncreate = template$2.oncreate.bind(this);

	if (!options._root) {
		this._oncreate = [oncreate];
	} else {
	 	this._root._oncreate.push(oncreate);
	 }

	this._fragment = create_main_fragment$2(this._state, this);

	if (options.target) {
		this._fragment.create();
		this._fragment.mount(options.target, options.anchor || null);

		callAll$1$1(this._oncreate);
	}
}

assign$1$1(ModalContent.prototype, template$2.methods, proto$1$1 );

var template = (function() {
return {
  data () {
    return Object.assign({}, Modal.DEFAULTS, {
      shouldShowModal: false,
      modalResult: 'None thus far.',
      showModalResult: false
    })
  }
}
}());

function create_main_fragment(state, component) {
	var h1, text, text_1, label, text_2, input, text_4, label_1, text_5, input_1, text_7, button, text_8, text_9, p, strong, text_10, text_11, text_12_value = state.modalResult || '', text_12, text_13, if_block_anchor;

	function input_change_handler() {
		component.set({ center: input.checked });
	}

	function input_1_change_handler() {
		component.set({ trapFocus: input_1.checked });
	}

	function click_handler(event) {
		component.set({ shouldShowModal: true, modalResult: '' });
	}

	var if_block = (state.shouldShowModal) && create_if_block(state, component);

	return {
		create: function() {
			h1 = createElement$1$1("h1");
			text = createText$1("svelte-modal");
			text_1 = createText$1("\n\n");
			label = createElement$1$1("label");
			text_2 = createText$1("Center modal\n  ");
			input = createElement$1$1("input");
			text_4 = createText$1("\n\n");
			label_1 = createElement$1$1("label");
			text_5 = createText$1("Trap focus\n  ");
			input_1 = createElement$1$1("input");
			text_7 = createText$1("\n\n");
			button = createElement$1$1("button");
			text_8 = createText$1("Open Modal");
			text_9 = createText$1("\n\n");
			p = createElement$1$1("p");
			strong = createElement$1$1("strong");
			text_10 = createText$1("Modal result:");
			text_11 = createText$1(" ");
			text_12 = createText$1(text_12_value);
			text_13 = createText$1("\n\n");
			if (if_block) if_block.create();
			if_block_anchor = createComment();
			this.hydrate();
		},

		hydrate: function(nodes) {
			input.type = "checkbox";
			addListener$1(input, "change", input_change_handler);
			input_1.type = "checkbox";
			addListener$1(input_1, "change", input_1_change_handler);
			addListener$1(button, "click", click_handler);
		},

		mount: function(target, anchor) {
			insertNode$1$1(h1, target, anchor);
			appendNode$1$1(text, h1);
			insertNode$1$1(text_1, target, anchor);
			insertNode$1$1(label, target, anchor);
			appendNode$1$1(text_2, label);
			appendNode$1$1(input, label);

			input.checked = state.center;

			insertNode$1$1(text_4, target, anchor);
			insertNode$1$1(label_1, target, anchor);
			appendNode$1$1(text_5, label_1);
			appendNode$1$1(input_1, label_1);

			input_1.checked = state.trapFocus;

			insertNode$1$1(text_7, target, anchor);
			insertNode$1$1(button, target, anchor);
			appendNode$1$1(text_8, button);
			insertNode$1$1(text_9, target, anchor);
			insertNode$1$1(p, target, anchor);
			appendNode$1$1(strong, p);
			appendNode$1$1(text_10, strong);
			appendNode$1$1(text_11, p);
			appendNode$1$1(text_12, p);
			insertNode$1$1(text_13, target, anchor);
			if (if_block) if_block.mount(target, anchor);
			insertNode$1$1(if_block_anchor, target, anchor);
		},

		update: function(changed, state) {
			input.checked = state.center;

			input_1.checked = state.trapFocus;

			if ( (changed.modalResult) && text_12_value !== (text_12_value = state.modalResult || '') ) {
				text_12.data = text_12_value;
			}

			if (state.shouldShowModal) {
				if (if_block) {
					if_block.update(changed, state);
				} else {
					if_block = create_if_block(state, component);
					if_block.create();
					if_block.mount(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.unmount();
				if_block.destroy();
				if_block = null;
			}
		},

		unmount: function() {
			detachNode$1$1(h1);
			detachNode$1$1(text_1);
			detachNode$1$1(label);
			detachNode$1$1(text_4);
			detachNode$1$1(label_1);
			detachNode$1$1(text_7);
			detachNode$1$1(button);
			detachNode$1$1(text_9);
			detachNode$1$1(p);
			detachNode$1$1(text_13);
			if (if_block) if_block.unmount();
			detachNode$1$1(if_block_anchor);
		},

		destroy: function() {
			removeListener$1(input, "change", input_change_handler);
			removeListener$1(input_1, "change", input_1_change_handler);
			removeListener$1(button, "click", click_handler);
			if (if_block) if_block.destroy();
		}
	};
}

function create_if_block(state, component) {
	var modalcontent_updating = {}, modal_updating = {}, text_1, p, strong, text_2, text_3, text_4, text_5, text_6, text_7;

	var modalcontent_initial_data = {};
	if ('initialFocusElement' in state) {
		modalcontent_initial_data.initialFocusElement = state.initialFocusElement
      ;
		modalcontent_updating.initialFocusElement = true;
	}
	var modalcontent = new ModalContent({
		_root: component._root,
		data: modalcontent_initial_data,
		_bind: function(changed, childState) {
			var state = component.get(), newState = {};
			if ( !modalcontent_updating.initialFocusElement && changed.initialFocusElement ) {
				newState.initialFocusElement = childState.initialFocusElement;
			}
			modalcontent_updating = assign$1$1({}, changed);
			component._set(newState);
			modalcontent_updating = {};
		}
	});

	component._root._beforecreate.push(function () {
		var state = component.get(), childState = modalcontent.get(), newState = {};
		if (!childState) return;
		if ( !modalcontent_updating.initialFocusElement ) {
			newState.initialFocusElement = childState.initialFocusElement;
		}
		modalcontent_updating = { initialFocusElement: true };
		component._set(newState);
		modalcontent_updating = {};
	});

	modalcontent.on("modal.dismiss", function(event) {
		component.refs.modal.dismiss(event);
	});

	modalcontent.on("modal.close", function(event) {
		component.refs.modal.close(event);
	});

	component.refs.modalContent = modalcontent;

	var modal_initial_data = {
		initialFocusElement: state.initialFocusElement,
		center: state.center,
		trapFocus: state.trapFocus
	};
	if ('opening' in state) {
		modal_initial_data.opening = state.opening
    ;
		modal_updating.opening = true;
	}
	if ('hiding' in state) {
		modal_initial_data.hiding = state.hiding
    ;
		modal_updating.hiding = true;
	}
	var modal = new Modal({
		_root: component._root,
		slots: { default: createFragment() },
		data: modal_initial_data,
		_bind: function(changed, childState) {
			var state = component.get(), newState = {};
			if ( !modal_updating.opening && changed.opening ) {
				newState.opening = childState.opening;
			}

			if ( !modal_updating.hiding && changed.hiding ) {
				newState.hiding = childState.hiding;
			}
			modal_updating = assign$1$1({}, changed);
			component._set(newState);
			modal_updating = {};
		}
	});

	component._root._beforecreate.push(function () {
		var state = component.get(), childState = modal.get(), newState = {};
		if (!childState) return;
		if ( !modal_updating.opening ) {
			newState.opening = childState.opening;
		}

		if ( !modal_updating.hiding ) {
			newState.hiding = childState.hiding;
		}
		modal_updating = { opening: true, hiding: true };
		component._set(newState);
		modal_updating = {};
	});

	modal.on("result", function(event) {
		component.set({ modalResult: event });
	});

	modal.on("hidden", function(event) {
		component.set({ shouldShowModal: false });
	});

	component.refs.modal = modal;

	return {
		create: function() {
			modalcontent._fragment.create();
			modal._fragment.create();
			text_1 = createText$1("\n  ");
			p = createElement$1$1("p");
			strong = createElement$1$1("strong");
			text_2 = createText$1("Modal state:");
			text_3 = createText$1("\n    { opening: ");
			text_4 = createText$1(state.opening);
			text_5 = createText$1(", hiding: ");
			text_6 = createText$1(state.hiding);
			text_7 = createText$1(" }");
		},

		mount: function(target, anchor) {
			modalcontent._mount(modal._slotted.default, null);
			modal._mount(target, anchor);
			insertNode$1$1(text_1, target, anchor);
			insertNode$1$1(p, target, anchor);
			appendNode$1$1(strong, p);
			appendNode$1$1(text_2, strong);
			appendNode$1$1(text_3, p);
			appendNode$1$1(text_4, p);
			appendNode$1$1(text_5, p);
			appendNode$1$1(text_6, p);
			appendNode$1$1(text_7, p);
		},

		update: function(changed, state) {
			var modalcontent_changes = {};
			if (!modalcontent_updating.initialFocusElement && changed.initialFocusElement) {
				modalcontent_changes.initialFocusElement = state.initialFocusElement
      ;
				modalcontent_updating.initialFocusElement = true;
			}
			modalcontent._set( modalcontent_changes );
			modalcontent_updating = {};

			var modal_changes = {};
			if (changed.initialFocusElement) modal_changes.initialFocusElement = state.initialFocusElement;
			if (changed.center) modal_changes.center = state.center;
			if (changed.trapFocus) modal_changes.trapFocus = state.trapFocus;
			if (!modal_updating.opening && changed.opening) {
				modal_changes.opening = state.opening
    ;
				modal_updating.opening = true;
			}
			if (!modal_updating.hiding && changed.hiding) {
				modal_changes.hiding = state.hiding
    ;
				modal_updating.hiding = true;
			}
			modal._set( modal_changes );
			modal_updating = {};

			if ( changed.opening ) {
				text_4.data = state.opening;
			}

			if ( changed.hiding ) {
				text_6.data = state.hiding;
			}
		},

		unmount: function() {
			modal._unmount();
			detachNode$1$1(text_1);
			detachNode$1$1(p);
		},

		destroy: function() {
			modalcontent.destroy(false);
			if (component.refs.modalContent === modalcontent) component.refs.modalContent = null;
			modal.destroy(false);
			if (component.refs.modal === modal) component.refs.modal = null;
		}
	};
}

function Demo(options) {
	this.options = options;
	this.refs = {};
	this._state = assign$1$1(template.data(), options.data);

	this._observers = {
		pre: Object.create(null),
		post: Object.create(null)
	};

	this._handlers = Object.create(null);

	this._root = options._root || this;
	this._yield = options._yield;
	this._bind = options._bind;

	if (!options._root) {
		this._oncreate = [];
		this._beforecreate = [];
		this._aftercreate = [];
	}

	this._fragment = create_main_fragment(this._state, this);

	if (options.target) {
		this._fragment.create();
		this._fragment.mount(options.target, options.anchor || null);

		this._lock = true;
		callAll$1$1(this._beforecreate);
		callAll$1$1(this._oncreate);
		callAll$1$1(this._aftercreate);
		this._lock = false;
	}
}

assign$1$1(Demo.prototype, proto$1$1 );

window.app = new Demo({ target: document.getElementById('app') });

}());
