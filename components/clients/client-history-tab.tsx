"use client";

import React from "react";
import Link from "next/link";
import { useClientHistory } from "@/hooks/use-clients";

export function ClientHistoryTab({ clientId }: { clientId: string }) {
  const { data: history, isLoading } = useClientHistory(clientId);

  if (isLoading) {
    return <p className="text-xs text-slate-500">Loading history...</p>;
  }

  return (
    <div className="space-y-4 text-xs">
      <div>
        <h4 className="font-semibold mb-1.5">
          Quotations ({history?.quotations.length ?? 0})
        </h4>
        {history?.quotations.length === 0 ? (
          <p className="text-slate-500">No quotations yet.</p>
        ) : (
          <div className="space-y-1.5">
            {history?.quotations.map((q) => (
              <div
                key={q.id}
                className="flex items-center justify-between p-2.5 rounded bg-white/50 dark:bg-slate-800/40"
              >
                <span className="font-medium">{q.quote_number}</span>
                <div className="flex items-center gap-3">
                  <span className="capitalize">
                    {q.status} · ${Number(q.total).toLocaleString()}
                  </span>
                  <Link
                    href="/quotations"
                    className="text-[#f97316] hover:underline font-medium"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h4 className="font-semibold mb-1.5">
          Invoices ({history?.invoices.length ?? 0})
        </h4>
        {history?.invoices.length === 0 ? (
          <p className="text-slate-500">No invoices yet.</p>
        ) : (
          <div className="space-y-1.5">
            {history?.invoices.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between p-2.5 rounded bg-white/50 dark:bg-slate-800/40"
              >
                <span className="font-medium">{inv.invoice_number}</span>
                <div className="flex items-center gap-3">
                  <span className="capitalize">
                    {inv.status.replace("_", " ")} · Paid $
                    {Number(inv.amount_paid).toLocaleString()} / $
                    {Number(inv.total).toLocaleString()}
                  </span>
                  <Link
                    href="/invoices"
                    className="text-[#f97316] hover:underline font-medium"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h4 className="font-semibold mb-1.5">
          Projects ({history?.projects.length ?? 0})
        </h4>
        {history?.projects.length === 0 ? (
          <p className="text-slate-500">No projects yet.</p>
        ) : (
          <div className="space-y-1.5">
            {history?.projects.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-2.5 rounded bg-white/50 dark:bg-slate-800/40"
              >
                <span className="font-medium">{p.name}</span>
                <div className="flex items-center gap-3">
                  <span className="capitalize">
                    {p.status.replace("_", " ")}
                  </span>
                  <Link
                    href={`/projects/${p.id}`}
                    className="text-[#f97316] hover:underline font-medium"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
