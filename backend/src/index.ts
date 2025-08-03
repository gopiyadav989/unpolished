import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { authRouter } from './routes/authRouter';
import { blogRouter } from './routes/blogRouter';
import { userRouter } from './routes/userRouter';
import { commentRouter } from './routes/commentRouter';
import { profileRouter } from './routes/profileRouter';



const app = new Hono();

app.use("*", cors());

app.route("/api/v1/user", userRouter);
app.route("/api/v1/blog", blogRouter);
app.route("/api/v1/auth", authRouter);
app.route("/api/v1/comments", commentRouter);
app.route("/api/v1/profile", profileRouter);

app.get('/', (c) => c.json({
    status: 'ok',
    message: 'all ok'
}));

export default app;