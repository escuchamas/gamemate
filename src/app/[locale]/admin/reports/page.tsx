import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { resolveReportAction, banUserAction } from "@/actions/admin";

const REASON_LABELS: Record<string, string> = {
  HARASSMENT: "Acoso",
  HATE_SPEECH: "Discurso de odio",
  CHEATING: "Trampas / hacks",
  GHOSTING: "Ghosting",
  INAPPROPRIATE_CONTENT: "Contenido inapropiado",
  SPAM: "Spam",
  OTHER: "Otro",
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  REVIEWED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  RESOLVED_ACTION: "bg-green-500/20 text-green-400 border-green-500/30",
  RESOLVED_NO_ACTION: "bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--card-border)]",
};

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      reporter: { select: { id: true, name: true, username: true } },
      reported: { select: { id: true, name: true, username: true, email: true, banned: true } },
    },
    take: 200,
  });

  const pending = reports.filter((r) => r.status === "PENDING");
  const resolved = reports.filter((r) => r.status !== "PENDING");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-white">Reportes</h1>
        {pending.length > 0 && (
          <p className="text-sm text-amber-400 mt-0.5">{pending.length} pendientes</p>
        )}
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <p className="text-4xl mb-3">🛡️</p>
          <p className="font-medium text-white">Sin reportes</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {[...pending, ...resolved].map((report) => (
            <div
              key={report.id}
              className={`rounded-xl border p-5 flex flex-col gap-3 ${
                report.status === "PENDING"
                  ? "bg-amber-500/5 border-amber-500/20"
                  : "bg-[var(--card)] border-[var(--card-border)]"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLES[report.status]}`}>
                    {report.status.replace(/_/g, " ")}
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {REASON_LABELS[report.reason] ?? report.reason}
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {new Date(report.createdAt).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>

              {/* Parties involved */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg bg-[var(--muted)] p-3">
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">Reportado por</p>
                  <p className="text-sm font-medium text-white">{report.reporter.name ?? "—"}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">@{report.reporter.username}</p>
                  <Link href={`/admin/users/${report.reporter.id}`} className="text-xs text-orange-400 hover:underline mt-1 block">
                    Ver actividad →
                  </Link>
                </div>
                <div className={`rounded-lg p-3 ${report.reported.banned ? "bg-red-500/10 border border-red-500/20" : "bg-[var(--muted)]"}`}>
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">Usuario reportado</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white">{report.reported.name ?? "—"}</p>
                    {report.reported.banned && <span className="text-xs text-red-400">baneado</span>}
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">{report.reported.email}</p>
                  <Link href={`/admin/users/${report.reported.id}`} className="text-xs text-orange-400 hover:underline mt-1 block">
                    Ver actividad y mensajes →
                  </Link>
                </div>
              </div>

              {/* Description */}
              {report.description && (
                <p className="text-sm text-[var(--muted-foreground)] bg-[var(--muted)] rounded-lg px-3 py-2">
                  "{report.description}"
                </p>
              )}

              {/* Actions */}
              {report.status === "PENDING" && (
                <div className="flex items-center gap-3 flex-wrap pt-1">
                  <form action={resolveReportAction.bind(null, report.id, "RESOLVED_NO_ACTION")}>
                    <button type="submit" className="text-xs text-[var(--muted-foreground)] hover:text-white transition-colors border border-[var(--card-border)] px-3 py-1.5 rounded-lg">
                      Sin acción
                    </button>
                  </form>
                  <form action={resolveReportAction.bind(null, report.id, "REVIEWED")}>
                    <button type="submit" className="text-xs text-blue-400 hover:text-blue-300 transition-colors border border-blue-500/30 px-3 py-1.5 rounded-lg">
                      Marcar revisado
                    </button>
                  </form>
                  {!report.reported.banned && (
                    <form
                      action={async (fd) => {
                        "use server";
                        const { banUserAction: ban, resolveReportAction: resolve } = await import("@/actions/admin");
                        await ban(report.reported.id, `Reporte: ${REASON_LABELS[report.reason]}`);
                        await resolve(report.id, "RESOLVED_ACTION");
                      }}
                    >
                      <button type="submit" className="text-xs text-red-400 hover:text-red-300 transition-colors border border-red-500/30 px-3 py-1.5 rounded-lg">
                        Banear usuario
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
