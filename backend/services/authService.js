import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { createToken } from "../config/jwt.js";

export const signupService = async ({ name, email, password, role }) => {
  try {
    //console.log("📝 Signup attempt:", { name, email, role });
    
    const exists = await User.findOne({ email });
    //console.log("🔍 Email exists?", !!exists);
    
    if (exists) {
      //console.log("❌ Email already registered");
      return { success: false, message: "Email already exists" };
    }

    //console.log("🔒 Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    //console.log("💾 Creating user...");
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role 
    });

   // console.log("✅ User created successfully:", user._id);
    return { success: true, user: { name: user.name, email: user.email, role: user.role } };
  } catch (error) {
   // console.error("❌ Signup service error:", error);
    return { success: false, message: "Signup failed: " + error.message };
  }
};

export const loginService = async ({ email, password, role }) => {
  try {
    console.log("🔐 Login attempt:", { email, role });
    
    const user = await User.findOne({ email });
    console.log("🔍 User found?", !!user);
    
    if (!user) {
      console.log("❌ User not found");
      return { success: false, message: "User not found" };
    }

    console.log("🔑 Comparing passwords...");
    const match = await bcrypt.compare(password, user.password);
    //console.log("🔑 Password match?", match);
    
    if (!match) {
      console.log("❌ Wrong password");
      return { success: false, message: "Wrong password" };
    }

    if (role !== user.role) {
      console.log("❌ Role mismatch");
      return { success: false, message: "Incorrect role selected" };
    }

    console.log("🎟️ Creating token...");
    const token = createToken({
      userId: user._id,
      role: user.role
    });

    //console.log("✅ Login successful");
    return {
      success: true,
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  } catch (error) {
    console.error("❌ Login service error:", error);
    return { success: false, message: "Login failed: " + error.message };
  }
};