// mysql 모듈 소환
const mariadb = require('mysql2');
 
// DB와 연결 통로 생선
const connection = mariadb.createConnection({
    host : '127.0.0.1',
    user : 'root',
    password : 'root',
    database : 'toyproject#1',
    dataStrings : true
});

module.exports = connection;