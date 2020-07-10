var _plugins = [];
var _byName = {};
var _cache = {};

function _isFunc(o) {
  return !!(o.constructor && o.call && o.apply);
}

function _get(obj, prop) {
  var arr = prop.split('.');
  for (var i = 0; i < arr.length; i++) {
    if (!obj.hasOwnProperty || !obj.hasOwnProperty(arr[i])) return undefined;
    obj = obj[arr[i]];
  }
  return obj;
}

function _has(obj, prop) {
  var arr = prop.split('.');
  for (var i = 0; i < arr.length; i++) {
    if (!obj.hasOwnProperty || !obj.hasOwnProperty(arr[i])) return false;
    obj = obj[arr[i]];
  }
  return true;
}

module.exports = {
  config: {},
  register: function(p) {
    if (!p.name) {
      console.log('Every plugin should have a name.');
      console.log(p);
      throw new Error('Every plugin should have a name.');
    }
    if (_byName[p.name]) {
      throw new Error('Plugin "' + p.name + '" already exits.');
    }
    _cache = {};
    _plugins = _plugins.slice();
    var pos = _plugins.length;
    _plugins.forEach((p2, i) => {
      if (p2.deps && p2.deps.indexOf(p.name) >= 0) {
        pos = Math.min(pos, i);
      }
    });
    _plugins.splice(pos, 0, p);
    _byName[p.name] = p;
    if (p.initialize) {
      p.initialize();
    }
  },

  unregister: function(name) {
    var p = _byName[name];
    if (!p) throw new Error('Plugin "' + name + '" does\'t exist.');
    var i = _plugins.indexOf(p);
    if (i === -1)
      throw new Error(
        'Plugin "' +
          name +
          '" does\'t exist in _plugins but in _byName. This seems to be a bug of js-plugin.'
      );
    _cache = {};
    delete _byName[name];
    _plugins = _plugins.slice();
    _plugins.splice(i, 1);
  },

  getPlugin: function(name) {
    return _byName[name];
  },

  getPlugins: function(prop) {
    if (!prop) {
      prop = '.';
    }
    if (!_cache[prop]) {
      _cache[prop] = _plugins.filter(p => {
        if (p.deps && p.deps.some(dep => !_byName[dep])) {
          // If deps not exist, then not load it.
          const notExistDeps = p.deps.filter(dep => !_byName[dep]);
          console.log(
            `Plugin ${p.name} is not loaded because its deps do not exist: ${notExistDeps}.`
          );
          return false;
        }
        return prop === '.' ? true : _has(p, prop);
      });
    }
    return _cache[prop];
  },

  processRawPlugins: function(callback) {
    // This method allows to process _plugins so that it could
    // do some unified pre-process before application starts.
    callback(_plugins);
    _cache = {};
  },

  invoke: function(prop) {
    var args = Array.prototype.slice.call(arguments, 1);
    if (!prop) throw new Error('Invoke on plugin should have prop argument');
    var noCall = /^!/.test(prop);
    var throws = this.config.throws || /!$/.test(prop);
    prop = prop.replace(/^!|!$/g, '');
    var arr = prop.split('.');
    arr.pop();
    var obj = arr.join('.');
    return this.getPlugins(prop).map(function(p) {
      var method = _get(p, prop);
      if (!_isFunc(method) || noCall) return method;
      try {
        return method.apply(_get(p, obj), args);
      } catch (err) {
        // When a plugin failed, doesn't break the app
        console.log('Failed to invoke plugin: ' + p.name + '!' + prop);
        if (throws) throw err;
        else console.log(err);
      }
      return null;
    });
  },
  sort: function(arr, sortProp) {
    // A helper method to sort an array according to 'order' (or by sortProp) property of the array element.
    sortProp = sortProp || 'order';
    arr.sort((a, b) => {
      var order1 = a.hasOwnProperty(sortProp) ? a[sortProp] : 1000000;
      var order2 = b.hasOwnProperty(sortProp) ? b[sortProp] : 1000000;
      return order1 - order2;
    });
  }
};
