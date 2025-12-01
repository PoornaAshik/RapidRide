
const url = "http://localhost:5500"
const token = localStorage.getItem("token");
if (!token) {
  alert("You must login first!");
  window.location.href = "login.html";
}

async function loadUser() {
  const res = await fetch(`${url}/auth/me`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const data = await res.json();

  if (data.success) {
    document.getElementById("welcome-text").innerText =
      `Logged in as: ${data.user.email} (${data.user.role})`;
  } else {
    alert("Session expired! Login again.");
    localStorage.removeItem("token");
    window.location.href = "login.html";
  }
}

loadUser();

// Logout
document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "login.html";
});
