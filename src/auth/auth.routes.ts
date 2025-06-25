import { Elysia } from "elysia";
import { authController } from "./auth.controller";

export const authRoutes = new Elysia().use(authController);