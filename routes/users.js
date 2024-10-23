const express = require("express"); //express 모듈
const router = express.Router();
const conn = require("../mariadb"); //db 모듈
const {signup, sign, passwordReset} = require('../controller/UserController');
router.use(express.json());

router.post("/signup", signup); //회원가입
router.post("/sign", sign); //로그인
router.post("/passwordReset", passwordReset); //로그인

module.exports = router;
