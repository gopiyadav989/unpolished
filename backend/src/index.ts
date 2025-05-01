import { Hono } from 'hono'
import { PrismaClient } from '../prisma/app/generated/prisma/client/edge';
import { cors } from 'hono/cors'

import { authRouter } from './routes/authRouter';
import { blogRouter } from './routes/blogRouter';
import { userRouter } from './routes/userRouter';



const app = new Hono();

app.use("*", cors());

app.route("/api/v1/user", userRouter);
app.route("/api/v1/blog", blogRouter);
app.route("/api/v1/auth", authRouter);

app.get('/', (c) => c.json({
    status: 'ok',
    message: 'all ok'
}));

export default app;