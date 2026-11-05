// Small, safe wrappers around localStorage so persistence never crashes the app
// (e.g. Safari private mode, blocked storage).

export const storage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* storage unavailable – state just won't persist */
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

export const KEYS = {
  token: "token",
  user: "user",
  settings: "ems_settings",
};

// Read the `exp` claim so we never boot into a session with an already-expired token.
// (The server is still the real authority – this just avoids a pointless 401 round trip.)
export function isTokenExpired(token) {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return !payload.exp || payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export function loadAuthState() {
  const token = storage.get(KEYS.token);
  let user = null;

  try {
    user = JSON.parse(storage.get(KEYS.user));
  } catch {
    user = null;
  }

  if (!token || !user || isTokenExpired(token)) {
    storage.remove(KEYS.token);
    storage.remove(KEYS.user);
    return { user: null, token: null, isAuthenticated: false };
  }

  return { user, token, isAuthenticated: true };
}

export function loadJson(key, fallback) {
  try {
    const parsed = JSON.parse(storage.get(key));
    return parsed && typeof parsed === "object"
      ? { ...fallback, ...parsed }
      : fallback;
  } catch {
    return fallback;
  }
}
