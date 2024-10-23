const conn = require("../mariadb"); //db 모듈
const { StatusCodes } = require("http-status-codes"); //status code 모듈
const jwt = require("jsonwebtoken");
const crypto = require('crypto'); //crypto 모듈 : 암호화
const dotenv = require("dotenv");
dotenv.config();


const signup = (req, res) => {

  const { username, password, nickname } = req.body;
  console.log(req.body);

  let sql = `INSERT INTO users (username, password, nickname, salt) VALUES (?, ?, ?, ?)`;

  //암호화된 비밀번호와 salt 값을 같이 DB에 저장
  const salt = crypto.randomBytes(10).toString('base64');
  const hashPassword = crypto.pbkdf2Sync(password, salt, 10000, 10, 'sha512').toString('base64');

  let values = [username, hashPassword, nickname, salt];
  conn.query(sql, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }
    const userId = results.insertId;
    const authoritySql = `INSERT INTO authorities (user_id, authority_name) VALUES (?, 'ROLE_USER')`;
    conn.query(authoritySql, [userId], (authErr, authResults) => {
      if (authErr) {
        console.log(authErr);
        return res.status(StatusCodes.BAD_REQUEST).end();
      }
      return res.status(StatusCodes.CREATED).json({
        username : username,
        nickname : nickname,
        authorities : [
          {
            authorityName : 'ROLE_USER'
          }
        ]
      });
  })
  });
};
const sign = (req, res) => {
  const { username, password } = req.body;
  let sql = `SELECT * FROM users WHERE username = ?`;
  conn.query(sql, username, function (err, results) {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }
    const loginUser = results[0];

    //salt 값 꺼내서 날 것으로 들어온 비밀번호 암호화 해보고
    const hashPassword = crypto.pbkdf2Sync(password, loginUser.salt, 10000, 10, 'sha512').toString('base64');

    // → 디비 비밀번호와 비교
    if (loginUser && loginUser.password == hashPassword) {
      //token 발급
      const token = jwt.sign({
          username : loginUser.username,
          nickname : loginUser.nickname
        },
        process.env.PRIVATE_KEY,{
          expiresIn: "30m",
          issuer: "peayss",
        }
      );
      res.cookie("token", token, {
        httpOnly: true,
      });
      console.log(token);
      res.status(StatusCodes.OK).json({
        token : token
      });
    } else {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: "이름 또는 비밀번호가 틀렸습니다",
      });
    }
  });
};
const passwordReset = (req, res) => {
    const { username, password } = req.body;
  
    let sql = `UPDATE users SET password = ?, salt = ? WHERE username = ?`;
  
    const salt = crypto.randomBytes(10).toString('base64');
    const hashPassword = crypto.pbkdf2Sync(password, salt, 10000, 10, 'sha512').toString('base64');
   
    let values = [hashPassword, salt, username];
    conn.query(sql, values,
      function(err, results) {
        if (err){
        console.log(err)
        return res.status(StatusCodes.BAD_REQUEST).end();
      }
  
      if (results.affectedRows == 0)
        return res.status(StatusCodes.BAD_REQUEST).end();
      else
      res.status(StatusCodes.OK).json(results);
      })
  };
module.exports = { 
  signup,
  sign,
  passwordReset
};
