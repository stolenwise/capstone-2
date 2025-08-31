export const likesKey = (username) => `waggr:${username}:likes`;

export function clearMatchesStorage(username) {
  if (!username) return;
  localStorage.removeItem(likesKey(username));
}