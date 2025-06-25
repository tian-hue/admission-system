import { Elysia } from "elysia";
import jwt from "jsonwebtoken";

// Definisikan tipe Role dan User
type Role = "ADMIN" | "GUEST";
interface User {
  userId: number;
  role: Role;
}

export const authMiddleware = new Elysia()
  .state("user", null as User | null)
  .derive(async ({ headers, set, store }) => {
    const authHeader = headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { user: null };
    }

    const token = authHeader.split(" ")[1];
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as User;
      store.user = payload;
      return { user: payload };
    } catch {
      return { user: null };
    }
  })
  .macro(({ onBeforeHandle }) => ({
    restrict(roles: Role[]) {
      onBeforeHandle(({ user, set }) => {
        if (!user || !roles.includes(user.role)) {
          set.status = 403;
          throw new Error("Akses ditolak");
        }
      });
    },
  }));
