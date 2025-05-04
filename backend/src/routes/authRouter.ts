import { Hono } from 'hono'
import { PrismaClient } from '../../prisma/app/generated/prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt'
import { signinInput, signupInput, jwtPayloadSchema } from '@gopiyadav989/unpolished';



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

        const body =  await c.req.json();
        const validation = signupInput.safeParse(body);

        if(!validation.success){
            return c.json({ error: "invalid input data", details: validation.error.errors }, 400);
        }

        const { email, username, password, name } = validation.data;

        const user = await prisma.user.create({
            data: {
                email,
                username,
                hashedPassword: password,
                name,
            }
        })

        const token = await sign(
            jwtPayloadSchema.parse({
                id: user.id,
                username: user.username,
                email: user.email
            }),
            c.env.JWT_SECRET
        );

        return c.json({
            message: "signed up successfull",
            user: {
                id: user.id,
                emai: user.email,
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

        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user || user.hashedPassword != password ) {
            return c.json({ message: "wrong credentials" }, 401);
        }

        const token = await sign(
            {
                id: user.id,
                username: user.username,
                email: user.email
            },
            c.env.JWT_SECRET
        );

        return c.json({
            message: 'signin successful',
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
        console.log(e);
        return c.json({ error: 'Login failed' }, 500);
    }


})