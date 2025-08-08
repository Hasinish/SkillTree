
export function saveToken(token) {
  localStorage.setItem("skilltree_token", token);
}
export function getToken() {
  return localStorage.getItem("skilltree_token");
}
export function clearToken() {
  localStorage.removeItem("skilltree_token");
}

export function saveIsAdmin(flag) {
  localStorage.setItem("skilltree_isAdmin", String(flag));
}
export function getIsAdmin() {
  return localStorage.getItem("skilltree_isAdmin") === "true";
}
export function clearIsAdmin() {
  localStorage.removeItem("skilltree_isAdmin");
}


export function clearAuth() {
  clearToken();
  clearIsAdmin();
}
