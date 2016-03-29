# WebStorageCookieStore
A cookie store for the tough-cookie library based on Web Storage APIs (localStorage and sessionStorage)

## Usage

```js
import { CookieJar } from 'tough-cookie';
import WebStorageCookieStore from 'tough-cookie-web-storage-store';

let store = new WebStorageCookieStore(localStorage);
let cookieJar = new CookieJar(store);
```
