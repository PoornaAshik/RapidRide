console.log("SIGNUP.JS LOADED!");
const url = "http://localhost:5500"
async function signup() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  if (!name || !email || !password) {
    alert("Please fill in all fields");
    return;
  }

  try {
    const res = await fetch(`${url}/auth/signup`, {  
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role })
    });

    const data = await res.json();
    console.log("Signup response:", data);

    if (data.success) {
      alert("Signup successful! Redirecting to login...");
      window.location.href = "login.html";
    } else {
      alert("Signup failed: " + data.message);
    }
  } catch (error) {
    alert("ERROR: " + error.message);
    console.error("Full error:", error);
  }
}