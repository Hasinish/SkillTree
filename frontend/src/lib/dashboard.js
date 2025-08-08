// frontend/src/lib/dashboard.js
export function getLearning() {
  return JSON.parse(localStorage.getItem("skilltree_learning") || "[]");
}

export function addLearning(skillId) {
  const list = getLearning();
  if (!list.includes(skillId)) {
    list.push(skillId);
    localStorage.setItem("skilltree_learning", JSON.stringify(list));
  }
}
