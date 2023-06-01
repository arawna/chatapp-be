const router = require('express').Router();
let db = require('diskdb');
db = db.connect('./db', ['users']);
let CryptoJS = require("crypto-js");
const jwt = require('jsonwebtoken');

router.post("/register", (req,res) => {
    const {name, email, password} = req.body;
    if(!name || !email || !password) {
        res.status(400).json({status: false, message: "Gerekli alanları doldurunuz"});
        return;
    }
    if(db.users.findOne({email})) {
        res.status(400).json({status: false, message: "Bu email adresi kullanılmaktadır"});
        return;
    }
    let cryptedPassword = CryptoJS.AES.encrypt(password,password).toString();
    db.users.save({name, email, password: cryptedPassword, createdAt: new Date().getTime()});
    res.json({status: true, message: "Kayıt başarılı"});
})

router.post("/login", (req,res) => {
    const {email, password} = req.body;
    if(!email || !password) {
        res.status(400).json({status: false, message: "Gerekli alanları doldurunuz"});
        return;
    }
    let user = db.users.findOne({email});
    if(!user) {
        res.status(401).json({status: false, message: "Email yada parola hatalı"});
        return;
    }
    let decryptedPassword = "";
    try {
        decryptedPassword = CryptoJS.AES.decrypt(user.password, password).toString(CryptoJS.enc.Utf8);
    } catch (error) {
        res.status(401).json({status: false, message: "Email yada parola hatalı"});
        return;
    }
    if(password != decryptedPassword) {
        res.status(401).json({status: false, message: "Email yada parola hatalı"});
        return;
    }
    const payload = {
        userId: user._id,
        name: user.name,
        email: user.email
    }
    const token = jwt.sign(payload, req.app.get("api_secret_key"), { expiresIn: "24h", algorithm: "HS256"});
    res.json({
        status: true,
        message: "Giriş başarılı",
        token,
        name: user.name,
    })
})


module.exports = router;