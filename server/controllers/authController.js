import jwt from "jsonwebtoken";
export function login(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password)
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  )
    return res.status(401).json({ message: "Invalid username or password." });
  const token = jwt.sign({ role: "admin", username }, process.env.JWT_SECRET, {
    expiresIn: "4h",
  });
  res.json({ token, username });
}
