const url = location.origin;
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  if (!email || !password) {
    alert("Please fill in all fields");
    return;
  }

  try {
    const res = await fetch(`${url}/auth/login`, {  
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role })
    });

    // Debug: log status and raw response before parsing
    console.log('Login response status:', res.status, res.statusText);
    const raw = await res.text();
    console.log('Login raw response:', raw);

    let data;
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch (err) {
      console.error('Failed to parse login response as JSON:', err);
      alert('Server returned invalid response. Check server logs.');
      return;
    }

    if (data.success) {
      localStorage.setItem("token", data.token);
      alert("Login successful!");
      window.location.href = `${location.origin}/rider/pages/dashboard.html`; // Changed to use absolute origin-based path
    } else {
      alert(data.message || "Login failed");
    }
  } catch (error) {
    alert("Network error: " + error.message);
  }
}