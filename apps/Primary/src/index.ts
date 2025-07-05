import express from 'express';
import cors from 'cors';
import { zapRouter } from './router/zap.js';
import { userRouter } from './router/user.js';
import { triggerRouter } from './router/trigger.js';
import { actionRouter } from './router/action.js';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
  credentials: true,
  origin: 'http://localhost:3002', 
}));

app.use(cookieParser());
app.use(express.json());


const PORT = 3000;
const HOST ='localhost';

app.use('/api/v1/user', userRouter);
app.use('/api/v1/zap', zapRouter);
app.use('/api/v1/trigger', triggerRouter);
app.use('/api/v1/action', actionRouter);

app.get("/debug-cookies", (req, res) => {
  console.log("Cookies:", req.cookies);
  res.json(req.cookies);
});


app.listen(PORT, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});