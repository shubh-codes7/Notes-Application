const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
    // Extract the token from the Authorization header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Get token part after "Bearer"

    // Check if token exists
    if (!token) {
        console.error("Authorization header missing or token not provided");
        return res.status(401).json({ error: "Token missing" }); // No token, unauthorized
    }

    // Verify token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            console.error("Token verification failed:", err.message); // Log the error message

            // Specific error handling based on error type
            if (err.name === "TokenExpiredError") {
                return res.status(403).json({ error: "Token expired" });
            } else if (err.name === "JsonWebTokenError") {
                return res.status(403).json({ error: "Token invalid" });
            } else {
                return res.status(403).json({ error: "Token verification failed" });
            }
        }

        // Token is valid
        req.user = user; // Attach user info to request
        next(); // Proceed to next middleware
    });
}

module.exports = { authenticateToken };
