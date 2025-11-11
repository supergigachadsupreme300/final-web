function chooseDrinkFromCategory(category) {
  document
    .querySelectorAll(".category-btn")
    .forEach((b) => b.classList.remove("active"));
  renderProducts(category, "", 1, {});

  document.getElementById(category).classList.add("active");
}
