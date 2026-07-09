const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
try {
console.log("Authorization:", req.headers.authorization);

const authHeader = req.headers.authorization;

if (!authHeader) {
return res.status(401).json({
message: "Access Denied. No token provided.",
});
}

const token = authHeader.split(" ")[1];

console.log("TOKEN:", token);

const decoded = jwt.verify(token, "taskflowsecret");

console.log("DECODED:", decoded);

req.user = decoded;

next();
} catch (err) {
console.log("JWT ERROR:");
console.log(err);

return res.status(401).json({
message: "Token is not valid",
});
}
};

module.exports = authMiddleware;