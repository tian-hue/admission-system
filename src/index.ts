import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { authRoutes } from "./auth/auth.routes";
import { admissionRoutes } from "./admission/admission.routes";
import fs from "fs";
import path from "path";

const app = new Elysia()
  .use(
    swagger({
      documentation: {
        info: {
          title: "API Sistem Pendaftaran",
          version: "1.0.0",
          description:
            "API untuk autentikasi dan manajemen data pendaftaran menggunakan JWT dan PostgreSQL",
        },
        tags: [
          { name: "Auth", description: "Endpoint untuk autentikasi pengguna" },
          {
            name: "Admission",
            description: "Endpoint untuk manajemen data pendaftaran",
          },
        ],
      },
      path: "/swagger", // URL untuk mengakses Swagger UI
    })
  )
  .use(authRoutes)
  .use(admissionRoutes)
  .get("/", ({ set }) => {
    set.status = 200;
    return { message: "Selamat datang di API Sistem Pendaftaran!" };
  })
  .listen(3000);

const pdfDir = path.join(process.cwd(), "public", "pdfs");
if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir, { recursive: true });
}

console.log(`Server berjalan di http://localhost:${app.server?.port}`);
console.log(
  `Dokumentasi Swagger tersedia di http://localhost:${app.server?.port}/swagger`
);
