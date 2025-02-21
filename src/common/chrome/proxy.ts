// Create a proxy class for Chrome
let ChromeProxy: any = chrome;

/**
 * Sets a proxy for the Chrome API.
 * This function creates a proxy for the Chrome API, allowing for interception and modification of certain methods.
 * The main logic involves creating a proxy for the `chrome.tabs` and `chrome.windows` namespaces.
 * If a method exists in the mock implementation (e.g., `tabs_get`), it will be used; otherwise, the original Chrome API method will be called.
 * @param chromeProxy - An object that provides mock implementations of Chrome API methods.
 * @example
 * ```typescript
 * class MyChromeProxy {
 *   public static tabs_get(tabId: number): Promise<chrome.tabs.Tab> {
 *     console.log(tabId);
 *     return chrome.tabs.get(tabId);
 *   }
 *   public static windows_create(createData: chrome.windows.CreateData): Promise<chrome.windows.Window> {
 *     console.log(createData);
 *     return chrome.windows.create(createData);
 *   }
 * }
 * setChromeProxy(MyChromeProxy);
 * ```
 * In this example, `tabs_get` is a mock implementation that logs the `tabId` before calling the original `chrome.tabs.get` method, and the same as `chrome.windows.create` method.
 */
export function setChromeProxy(chromeProxy: any): void {
  ChromeProxy = new Proxy(chrome, {
    get(target: any, prop: string | symbol) {
      if (typeof prop === "string") {
        // If the property is 'tabs' or 'windows', create a nested proxy
        if (prop === "tabs" || prop === "windows") {
          return new Proxy(target[prop], {
            get(targetProp: any, method: string | symbol) {
              if (typeof method === "string") {
                // Construct the mock method name (e.g., 'tabs_create')
                const mockMethodName = `${prop}_${method}`;
                // Check if the mock method exists
                const mockMethod = (chromeProxy as any)[mockMethodName];
                if (mockMethod) {
                  // If the mock method exists, return it
                  return mockMethod;
                } else {
                  // Otherwise, return the original Chrome API method
                  return targetProp[method];
                }
              }
              return undefined;
            }
          });
        }
      }
      // For other properties, return the original Chrome property
      return target[prop as string]; // Use type assertion to avoid compilation errors
    }
  });
}

/**
 * Retrieves the current Chrome API proxy.
 * This function returns the proxy object created by `setChromeProxy`, which can be used to access the proxied Chrome API methods.
 * @returns The proxied Chrome API object.
 * @example
 * ```typescript
 * const chrome = getChromeProxy();
 * chrome.tabs.get(1).then(tab => console.log(tab));
 * ```
 * In this example, `getChromeProxy` is used to retrieve the proxied Chrome API object, and then `tabs.get` is called on it.
 */
export function getChromeProxy(): any {
  return ChromeProxy;
}

class MyChromeProxy {
  public static windows_create(createData: chrome.windows.CreateData): Promise<chrome.windows.Window> {
    console.log("kyf: proxy successfully!");
    return chrome.windows.create(createData);
  }
}

setChromeProxy(MyChromeProxy);
