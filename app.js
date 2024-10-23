const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));

const usersRouter = require('./routes/users');
app.use("/users", usersRouter);

// 404 처리 미들웨어 추가 (optional)
app.use((req, res, next) => {
    res.status(404).send('Page not found');
});

app.listen(process.env.PORT);
