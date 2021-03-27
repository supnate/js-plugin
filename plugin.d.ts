export interface ExtensionPoint {
  [extPoint: string]: (...args) => unknown;
}

export interface Plugin {
  name: string;
  initialize?: () => void;

  /**
   * ExtensionPoint can be nested, e.g. 'menu.processMenuItems'
   * When index signature is provided, every key have to match the type, the type for 'name' and 'initialize' is added as index signature.
   */
  [key: string]: string | (() => void) | ExtensionPoint | ((...args) => unknown);
}

export function register(plugin: Plugin): void;
export function unregister(name: string): void;
export function getPlugin(name: string): Plugin;
export function getPlugins(extPoint: string): Plugin[];
export function processRawPlugins(callback: (plugins: Plugin[]) => void): void;
export function invoke(extPoint: string, ...args): unknown;
export function sort(arr: unknown[], sortProp: string): void;
