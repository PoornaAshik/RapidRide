import { signupService, loginService } from "../services/authService.js";

export const signup = async (req, res) => {
  try {

    if (req.body.role === "admin") {
  return res.status(403).json({ message: "Admin accounts cannot be created through signup" });
}
    console.log("📨 Signup request received:", req.body);
    const result = await signupService(req.body);
    console.log("📤 Sending response:", result);

    if (result.success) {
      return res.status(201).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("💥 Controller error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error: " + error.message 
    });
  }
};

export const login = async (req, res) => {
  try {
    console.log("📨 Login request received:", req.body);
    const result = await loginService(req.body);
    console.log("📤 Sending response:", result);
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(401).json(result);
    }
  } catch (error) {
    console.error("💥 Controller error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error: " + error.message 
    });
  }
};