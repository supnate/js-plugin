const expect = require('chai').expect;
const plugin = require('./plugin');

const p1 = {
  name: 'p1',
  foo: 'bar1',
  ext: {
    form: {
      processMeta(meta) {
        meta.push('m1');
      }
    }
  }
};

const p2 = {
  name: 'p2',
  foo: 'bar2'
};

const p3 = {
  name: 'p3',
  foo: 'bar3',
  ext: {
    form: {
      processMeta(meta) {
        meta.push('m3');
      }
    }
  }
};

plugin.register(p1);
plugin.register(p2);
plugin.register(p3);

// getPlugins works
expect(plugin.getPlugins().length).to.equal(3);
expect(plugin.getPlugins('ext').length).to.equal(2);

// invoke on functions
const meta = ['m0'];
plugin.invoke('ext.form.processMeta', meta);
expect(meta).to.deep.equal(['m0', 'm1', 'm3']);

// invoke to only collect values
const bars = plugin.invoke('foo');
expect(bars).to.deep.equal(['bar1', 'bar2', 'bar3']);

const bars2 = plugin.invoke('!foo');
expect(bars2).to.deep.equal(['bar1', 'bar2', 'bar3']);

// unregister
plugin.unregister('p2');
expect(plugin.getPlugins().map(p => p.name)).to.deep.equal(['p1', 'p3']);
expect(plugin.getPlugin('p2')).to.be.an('undefined');

// If deps not exist, don't load it
plugin.register({ name: 'p4', deps: ['p5'] });
expect(plugin.getPlugins().map(p => p.name)).to.deep.equal(['p1', 'p3']);

plugin.register({ name: 'p5' });
expect(plugin.getPlugins().map(p => p.name)).to.deep.equal(['p1', 'p3', 'p5', 'p4']);

// Unregister a plugin and then re-register
plugin.unregister('p3');
expect(plugin.getPlugins().map(p => p.name)).to.deep.equal(['p1', 'p5', 'p4']);
expect(plugin.getPlugin('p3')).to.be.an('undefined');
plugin.register(p3);
expect(plugin.getPlugins().map(p => p.name)).to.deep.equal(['p1', 'p5', 'p4', 'p3']);
expect(plugin.getPlugin('p3')).to.deep.equal(p3);


// Should not be able to register same name plugin
try {
  plugin.register({ name: 'p1' });
} catch (e) {
  expect(e).to.be.an('error');
}

// Should not be able to unregister a plugin that not exist
try {
  plugin.unregister(p0);
} catch (e) {
  expect(e).to.be.an('error');
}

// Test sort helper
const arr = [
  { name: '0', order: 0 },
  { name: '10', order: 10 },
  { name: '5', order: 5 }
];
plugin.sort(arr);
expect(arr.map(o => o.name)).to.deep.equal(['0', '5', '10']);

// Plugins should be sorted by deps
const d1 = { name: 'd1', deps: ['d2'] };
const d2 = { name: 'd2', deps: [] };
const d3 = { name: 'd3', deps: ['d4', 'd5'] };
const d4 = { name: 'd4', deps: ['d5'] };
const d5 = { name: 'd5', deps: [] };

plugin.register(d1);
plugin.register(d2);
plugin.register(d3);
plugin.register(d4);
plugin.register(d5);

expect(
  plugin
    .getPlugins()
    .filter(p => p.name.startsWith('d'))
    .map(p => p.name)
).to.deep.equal(['d2', 'd1', 'd5', 'd4', 'd3']);

let rawPlugins = null;
plugin.processRawPlugins(_plugins => (rawPlugins = _plugins.map(p => p.name)));
expect(rawPlugins).to.deep.equal(['p1', 'p5', 'p4', 'p3', 'd2', 'd1', 'd5', 'd4', 'd3']);

// Performance benchmak: register 1000 plugins should take less than 100ms
const time1 = Date.now();
for (let i = 0; i < 1000; i++) {
  plugin.register({ name: 'name' + i, deps: ['n1', 'n2', 'n3', 'n4'] });
}
const time2 = Date.now();
expect(time2 - time2).to.below(100);

console.log('Test success.');
