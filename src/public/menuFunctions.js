const handleMenu = () => {
  const userBtn = document.getElementById("userBtn");

  userBtn.addEventListener("click", () => {
    const userMenu = document.getElementById("userMenu");
    userMenu.classList.toggle("hidden");
  });
};

document.addEventListener("DOMContentLoaded", () => {
  const userBtn = document.getElementById("userBtn");

  if (userBtn) handleMenu();
});
