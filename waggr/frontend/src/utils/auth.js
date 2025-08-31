export const likesKey = (username) => `waggr:${username}:likes`;


export function clearMatchesStorage(username) {
    localStorage.removeItem(likesKey(username));
  }