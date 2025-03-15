export const login = async (req, res) => {
  res
    .status(200)
    .json({ success: true, message: "you hit the login endpoint" });
};

export const signup = async (req, res) => {
  res
    .status(200)
    .json({ success: true, message: "you hit the signup endpoint" });
};

export const logout = async (req, res) => {
  res
    .status(200)
    .json({ success: true, message: "you hit the logout endpoint" });
};
