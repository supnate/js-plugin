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
    _plugins.push(p);
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
    _plugins = _plugins.slice();
    _plugins.splice(i, 1);
  },

  getPlugin: function(name) {
    return _byName[name];
  },

  getPlugins: function(prop) {
    if (!prop) {
      return _plugins.filter(p => !p.deps || p.deps.every(dep => !!_byName[dep]));
    }
    if (!_cache[prop]) {
      _cache[prop] = _plugins.filter(p => {
        if (p.deps && p.deps.some(dep => !_byName[dep])) {
          // If deps not exist, then not load it.
          return false;
        }
        return _has(p, prop);
      });
    }
    return _cache[prop];
  },

  invoke: function(prop) {
    var args = Array.prototype.slice.call(arguments, 1);
    if (!prop) throw new Error('Invoke on plugin should have prop argument');
    var noCall = /^!/.test(prop);
    prop = prop.replace(/^!/, '');
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
        console.log(err);
      }
      return null;
    });
  }
};
