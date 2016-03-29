'use strict';

let ToughCookie = require('tough-cookie');

let get = require('lodash/get');
let set = require('lodash/set');
let unset = require('lodash/unset');
let values = require('lodash/values');

let Cookie = ToughCookie.Cookie;

const STORE_KEY = '__cookieStore__';

class WebStorageCookieStore extends ToughCookie.Store {
  constructor(storage) {
    super();
    this._storage = storage;
    this.synchronous = true;
  }

  findCookie(domain, path, key, callback) {
    let store = this._readStore();
    let cookie = get(store, [domain, path, key], null);
    callback(null, Cookie.fromJSON(cookie));
  }

  findCookies(domain, path, callback) {
    if (!domain) {
      callback(null, []);
      return;
    }

    let cookies = [];
    let store = this._readStore();
    let domains = ToughCookie.permuteDomain(domain) || [domain];
    for (let domain of domains) {
      if (!store[domain]) {
        continue;
      }

      let matchingPaths = Object.keys(store[domain]);
      if (path != null) {
        matchingPaths = matchingPaths
          .filter(cookiePath => this._isOnPath(cookiePath, path));
      }

      for (let path of matchingPaths) {
        cookies.push(...values(store[domain][path]));
      }
    }

    cookies = cookies.map(cookie => Cookie.fromJSON(cookie));
    callback(null, cookies);
  }

  /**
   * Returns whether `cookiePath` is on the given `urlPath`
   */
  _isOnPath(cookiePath, urlPath) {
    if (!cookiePath) {
      return false;
    }

    if (cookiePath === urlPath) {
      return true;
    }

    if (!urlPath.startsWith(cookiePath)) {
      return false;
    }

    if (cookiePath[cookiePath.length - 1] !== '/' &&
        urlPath[cookiePath.length] !== '/') {
      return false;
    }
    return true;
  }

  putCookie(cookie, callback) {
    let store = this._readStore();
    set(store, [cookie.domain, cookie.path, cookie.key], cookie);
    this._writeStore(store);
    callback(null);
  }

  updateCookie(oldCookie, newCookie, callback) {
    this.putCookie(newCookie, callback);
  }

  removeCookie(domain, path, key, callback) {
    let store = this._readStore();
    unset(store, [domain, path, key]);
    this._writeStore(store);
    callback(null);
  }

  removeCookies(domain, path, callback) {
    let store = this._readStore();
    if (path == null) {
      unset(store, [domain]);
    } else {
      unset(store, [domain, path]);
    }
    this._writeStore(store);
    callback(null);
  }

  getAllCookies(callback) {
    let cookies = [];
    let store = this._readStore();
    for (let domain of Object.keys(store)) {
      for (let path of Object.keys(store[domain])) {
        cookies.push(...values(store[domain][path]));
      }
    }

    cookies = cookies.map(cookie => Cookie.fromJSON(cookie));
    cookies.sort((c1, c2) => (c1.creationIndex || 0) - (c2.creationIndex || 0));
    callback(null, cookies);
  }

  _readStore() {
    let json = this._storage.getItem(STORE_KEY);
    if (json != null) {
      try {
        return JSON.parse(json);
      } catch (e) { }
    }
    return {};
  }

  _writeStore(store) {
    this._storage.setItem(STORE_KEY, JSON.stringify(store));
  }
}

module.exports = WebStorageCookieStore;
