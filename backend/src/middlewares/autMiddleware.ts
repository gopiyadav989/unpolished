import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";
import { jwtPayloadSchema } from "@gopiyadav989/unpolished";



export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header("Authorization") || "";

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Authorization header missing or invalid format" }, 401);
  }

  // Extract token from "Bearer <token>"
  const token = authHeader.substring(7);

  try {
    const payload = await verify(token, c.env.JWT_SECRET);
    const parsedPayload = jwtPayloadSchema.parse(payload);

    c.set("user", parsedPayload);
    await next();
  }
  catch (e) {
    console.log("Auth middleware error:", e);
    return c.json({ error: "Invalid or expired token" }, 401);
  }
})


export const semiAuthMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header("Authorization") || "";

  // If no auth header, continue without setting user
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  // Extract token from "Bearer <token>"
  const token = authHeader.substring(7);

  try {
    const payload = await verify(token, c.env.JWT_SECRET);
    const parsedPayload = jwtPayloadSchema.parse(payload);

    c.set("user", parsedPayload);

    return next();
  } catch (e) {
    console.log("Semi-auth middleware error:", e);
    // For semi-auth, continue even if token is invalid
    return next();
  }
});