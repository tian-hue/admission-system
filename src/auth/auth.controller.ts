import { Elysia, t } from "elysia";
import { register, login } from "./auth.service";

export const authController = new Elysia({ prefix: "/auth" })
  .post(
    "/register",
    async ({ body, set }) => {
      const user = await register(body.email, body.password, body.role);
      set.status = 201;
      return {
        message: "Pengguna terdaftar",
        user: { id: user.id, email: user.email, role: user.role },
      };
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 6 }),
        role: t.Union([t.Literal("ADMIN"), t.Literal("GUEST")]),
      }),
      tags: ["Auth"],
      detail: {
        summary: "Mendaftarkan pengguna baru",
        description:
          "Membuat akun pengguna dengan email, password, dan peran (ADMIN atau GUEST).",
      },
    }
  )
  .post(
    "/login",
    async ({ body }) => {
      const { token, user } = await login(body.email, body.password);
      return {
        token,
        user: { id: user.id, email: user.email, role: user.role },
      };
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String(),
      }),
      tags: ["Auth"],
      detail: {
        summary: "Login pengguna",
        description: "Mengautentikasi pengguna dan mengembalikan token JWT.",
      },
    }
  );
