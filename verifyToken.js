const jwt = require('jsonwebtoken');

module.exports = (req,res,next) => {
    const token = req.headers["x-access-token"] || req.body.token || req.query.token;
    if(!token) {
        res.status(401).send("Token is required");
    }else {
        jwt.verify(token,req.app.get("api_secret_key"), (error,decoded) => {
            if(error) {
                res.status(401).send("Invalid token");
            }else {
                req.decode = decoded;
                next();
            }
        })
    }
}