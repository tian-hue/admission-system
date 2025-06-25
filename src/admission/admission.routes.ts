import { Elysia } from "elysia";
import { admissionController } from "./admission.controller";

export const admissionRoutes = new Elysia().use(admissionController);
