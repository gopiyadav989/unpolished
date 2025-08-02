import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt'
import { signinInput, signupInput } from '@gopiyadav989/unpolished';
import * as bcrypt from 'bcryptjs';



export const authRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    }
}>();

authRouter.post('/signup', async (c) => {

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {

        const body = await c.req.json();
        const validation = signupInput.safeParse(body);

        if (!validation.success) {
            return c.json({ error: "invalid input data", details: validation.error.errors }, 400);
        }

        const { email, username, password, name } = validation.data;

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
        });

        if (existingUser) {
            const field = existingUser.email === email ? 'email' : 'username';
            return c.json({ error: `User with this ${field} already exists` }, 409);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                username,
                name,
                hashedPassword
            },
            select: {
                id: true,
                email: true,
                username: true,
                name: true,
                profileImage: true
            }
        });

        const jwtPayload = {
            id: user.id,
            username: user.username,
            email: user.email
        };

        const token = await sign(jwtPayload, c.env.JWT_SECRET);

        return c.json({
            message: "User registered successfully",
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                name: user.name,
                profileImage: user.profileImage
            },
            token
        }, 201);
    }
    catch (e) {
        console.error('Registration error:', e);
        return c.json({ error: 'Registration failed' }, 500);
    }

})


authRouter.post('/signin', async (c) => {

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {

        const body = await c.req.json();
        const validation = signinInput.safeParse(body);

        if (!validation.success) {
            return c.json({ error: 'Invalid input data', details: validation.error.errors }, 400);
        }

        const { email, password } = validation.data;
        console.log(email, password);

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return c.json({ error: "Invalid credentials1" }, 401);
        }

        const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
        if (!isPasswordValid) {
            return c.json({ error: "Invalid credentials2" }, 401);
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
        });

        const jwtPayload = {
            id: user.id,
            username: user.username,
            email: user.email
        };

        const token = await sign(jwtPayload, c.env.JWT_SECRET);

        return c.json({
            message: 'Sign in successful',
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                name: user.name,
                profileImage: user.profileImage
            },
            token
        }, 200);
    }
    catch (e) {
        console.log(e);
        return c.json({ error: 'Login failed' }, 500);
    }


})