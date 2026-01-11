import jwt from "jsonwebtoken";

const isauth = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "User Not Authenticated",
        success: false,
      });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);

    if (!decode) {
      return res.status(401).json({
        message: "Invalid Token",
        success: false,
      });
    }

    req.id = decode.userId;
    next();
  } catch (error) {
    return res.status(500).json({
      message: "Server Error",
      success: false,
    });
  }
};

export default isauth;
