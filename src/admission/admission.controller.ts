import { Elysia, t } from "elysia";
import {
  createAdmission,
  updateAdmission,
  getAdmissions,
  getAdmissionById,
  deleteAdmission,
} from "./admission.service";
import { authMiddleware } from "../middleware/auth.middleware";
import * as fs from "fs";

type Role = "ADMIN" | "GUEST";
type User = { userId: number; role: Role } | null;

export const admissionController = new Elysia()
  .use(authMiddleware)
  .group("/admissions", (app) =>
    app
      .derive(({ store }) => {
        return {
          user: store.user as User,
        };
      })
      .post(
        "/",
        async ({ body, user, set }) => {
          if (!user || typeof user.userId !== "number") {
            set.status = 401;
            throw new Error("Pengguna tidak terautentikasi");
          }
          const admission = await createAdmission(body, user.userId);
          set.status = 201;
          return { message: "Pendaftaran dibuat", admission };
        },
        {
          restrict: ["ADMIN"],
          body: t.Object({
            name: t.String(),
            email: t.String({ format: "email" }),
            phone: t.String(),
            address: t.String(),
          }),
          tags: ["Admission"],
          detail: {
            summary: "Membuat pendaftaran baru",
            description:
              "Membuat data pendaftaran baru oleh ADMIN dan menghasilkan PDF.",
          },
        }
      )
      .put(
        "/:id",
        async ({ params, body, user }) => {
          if (!user || typeof user.userId !== "number") {
            throw new Error("Pengguna tidak terautentikasi");
          }
          const admission = await updateAdmission(
            parseInt(params.id),
            body,
            user.userId
          );
          return { message: "Pendaftaran diperbarui", admission };
        },
        {
          restrict: ["ADMIN"],
          params: t.Object({ id: t.String() }),
          body: t.Object({
            name: t.Optional(t.String()),
            email: t.Optional(t.String({ format: "email" })),
            phone: t.Optional(t.String()),
            address: t.Optional(t.String()),
          }),
          tags: ["Admission"],
          detail: {
            summary: "Memperbarui pendaftaran",
            description:
              "Memperbarui data pendaftaran oleh ADMIN dan memperbarui PDF.",
          },
        }
      )
      .get(
        "/",
        async ({ query, user }) => {
          if (!user || !["ADMIN", "GUEST"].includes(user.role)) {
            throw new Error("Akses ditolak");
          }
          const page = parseInt(query.page as string) || 1;
          const limit = parseInt(query.limit as string) || 10;
          return await getAdmissions(page, limit);
        },
        {
          restrict: ["ADMIN", "GUEST"],
          query: t.Object({
            page: t.Optional(t.String()),
            limit: t.Optional(t.String()),
          }),
          tags: ["Admission"],
          detail: {
            summary: "Mengambil daftar pendaftaran",
            description:
              "Mengambil daftar pendaftaran dengan paginasi (hanya untuk ADMIN dan GUEST).",
          },
        }
      )
      .get(
        "/:id",
        async ({ params, user }) => {
          if (!user || !["ADMIN", "GUEST"].includes(user.role)) {
            throw new Error("Akses ditolak");
          }
          const admission = await getAdmissionById(parseInt(params.id));
          if (!admission) throw new Error("Pendaftaran tidak ditemukan");
          return admission;
        },
        {
          restrict: ["ADMIN", "GUEST"],
          params: t.Object({ id: t.String() }),
          tags: ["Admission"],
          detail: {
            summary: "Mengambil pendaftaran berdasarkan ID",
            description:
              "Mengambil detail pendaftaran spesifik (hanya untuk ADMIN dan GUEST).",
          },
        }
      )
      .delete(
        "/:id",
        async ({ params, user }) => {
          if (!user || !["ADMIN"].includes(user.role)) {
            throw new Error("Akses ditolak");
          }
          const admission = await deleteAdmission(parseInt(params.id));
          return { message: "Pendaftaran dihapus", admission };
        },
        {
          restrict: ["ADMIN"],
          params: t.Object({ id: t.String() }),
          tags: ["Admission"],
          detail: {
            summary: "Menghapus pendaftaran",
            description: "Menghapus pendaftaran oleh ADMIN.",
          },
        }
      )
      .get(
        "/:id/download",
        async ({ params, set, user }) => {
          if (!user || !["ADMIN", "GUEST"].includes(user.role)) {
            set.status = 403;
            throw new Error("Akses ditolak");
          }
          const admission = await getAdmissionById(parseInt(params.id));
          if (
            !admission ||
            !admission.pdfPath ||
            !fs.existsSync(admission.pdfPath)
          ) {
            set.status = 404;
            throw new Error("PDF tidak ditemukan");
          }
          set.headers[
            "Content-Disposition"
          ] = `attachment; filename="admission_${admission.id}.pdf"`;
          set.headers["Content-Type"] = "application/pdf";
          return fs.readFileSync(admission.pdfPath); // Pastikan ini mengembalikan buffer biner
        },
        {
          restrict: ["ADMIN", "GUEST"],
          params: t.Object({ id: t.String() }),
          tags: ["Admission"],
          detail: {
            summary: "Mengunduh PDF pendaftaran",
            description: "Mengunduh file PDF pendaftaran berdasarkan ID.",
          },
        }
      )
  );
