const expect = require('chai').expect;
const plugin = require('./plugin');

const p1 = {
  name: 'p1',
  foo: 'bar1',
  ext: {
    form: {
      processMeta(meta) {
        meta.push('m1');
      },
    },
  },
};

const p2 = {
  name: 'p2',
  foo: 'bar2',
};

const p3 = {
  name: 'p3',
  foo: 'bar3',
  ext: {
    form: {
      processMeta(meta) {
        meta.push('m3');
      },
    },
  },
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

// If deps not exist, don't load it
plugin.register({ name: 'p4', deps: ['p5'] });
expect(plugin.getPlugins().map(p => p.name)).to.deep.equal(['p1', 'p3']);

plugin.register({ name: 'p5' });
expect(plugin.getPlugins().map(p => p.name)).to.deep.equal(['p1', 'p3', 'p4', 'p5']);

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

console.log('Test success.');
