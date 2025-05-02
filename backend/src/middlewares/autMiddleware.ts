import { createMiddleware } from "hono/factory";
import { Hono } from 'hono'
import { verify } from "hono/jwt";
import { jwtPayloadSchema } from "@gopiyadav989/unpolished";



export const authMiddleware = createMiddleware(async (c, next) => {
    const authHeader = c.req.header("Authorization") || "";

    try {
        const payload = await verify(authHeader, c.env.JWT_SECRET);
        const parsedPaylod = jwtPayloadSchema.parse(payload);

        if (payload) {
            c.set("user", parsedPaylod)
            await next();
        } else {
            c.status(403);
            return c.json({
                message: "You are not logged in"
            })
        }

    }
    catch (e) {
        console.log(e);
        return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }
})


export const semiAuthMiddleware = createMiddleware(async (c, next) => {
    const authHeader = c.req.header("Authorization") || "";
    
    if (!authHeader) {
      return next();
    }
    
    try {
      const payload = await verify(authHeader, c.env.JWT_SECRET);
      const parsedPayload = jwtPayloadSchema.parse(payload);
      
      if (payload) {
        c.set("user", parsedPayload);
      }
      
      return next();
    } catch (e) {
      console.log("Auth error:", e);
      return next();
    }
  });