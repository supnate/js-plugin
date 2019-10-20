# Overview
[![NPM](https://img.shields.io/npm/v/js-plugin.svg)](https://www.npmjs.com/package/js-plugin)
[![Build Status](https://travis-ci.org/rekit/js-plugin.svg?branch=master)](https://travis-ci.org/rekit/js-plugin)

[js-plugin](https://www.npmjs.com/package/js-plugin) is a general and simple plugin engine for creating extensible and maintainable JavaScript applications for both browser and nodejs.

# Motivation
Web applications are becoming more and more complicated nowadays. To separate concerns, decouple business logic, a large application should be well designed. One of best practices is plugin based architecture. Whenever you add a new feature, it should not add much complication to the system so that the project could be always maintainable when it grows.

Note that every plugin in the system maybe not bundled separatly but just a logical plugin. Below I give two cases about the advantages of plugin based architecture.

## Example 1: Menu
Menu is used to navigate among functions of an application. Whenever you add a new feature, it may need a menu item in the menu. Say that we have a menu component like below (from Github settings page):

```js
import React from 'react';

export default function Menu() {
  return (
    <ul>
      <li>Profile<li>
      <li>Account<li>
      <li>Security<li>
    </ul>
  );
}
```

Now we need to add a new feature to block users. It needs a menu item named 'Blocked users'. Normallly we need to change `Menu` component:
```js
return (
  <ul>
    <li>Profile<li>
    <li>Account<li>
    <li>Security<li>
    <li>Blocked Users<li>
  </ul>
);
```

It looks quite intuitive but it's not extensible. Whenever we add features to the application, we need to change Menu component and finally it will become too complicated to maintain. Especially the menu item is dynamically like it needs to be show or no show according to permission. We have to embed the permission logic in Menu component. For example: if the block user feature is only available for premium users:

```js
return (
  <ul>
    <li>Profile<li>
    <li>Account<li>
    <li>Security<li>
    {user.isPremium() && <li>Blocked Users<li>}
  </ul>
);
```

Essentially the menu item is a part of feature of 'block user'. All the logic of the feature should be only in the scope of the feature itself while the Menu is just a pure presentation component which is only responsible for navigation without knowing about other business logic.

So we need to make `Menu` extensible, that is it allows to register menu items. Below is how we do it using `js-plugin`.
## Example 2: Form

# Extension Points

# API Reference