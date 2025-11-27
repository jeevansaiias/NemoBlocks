"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export interface DailyTrade {
  id?: string | number;
  dateOpened?: string;
  strategy: string;
  legs: string;
  premium: number; // total premium per trade
  margin: number;  // max margin used
  pl: number;
}

export interface DaySummary {
  date: Date;
  netPL: number;
  tradeCount: number;
  winRate: number;
  winCount: number;
  maxMargin: number;
  trades: DailyTrade[];
}

export interface DailyDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: DaySummary | null;
}

const fmtUsd = (v: number) =>
  `${v >= 0 ? "+" : "-"}$${Math.abs(v).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export function DailyDetailModal({
  open,
  onOpenChange,
  summary,
}: DailyDetailModalProps) {
  if (!summary) return null;

  const { date, netPL, tradeCount, winRate, maxMargin, trades } = summary;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-full border border-neutral-800 bg-[#050506] text-sm p-0 overflow-hidden">
        {/* HEADER */}
        <header className="px-6 pt-5 pb-4 border-b border-neutral-800 flex items-start justify-between gap-4">
          <div>
            <DialogTitle className="text-2xl font-semibold tracking-tight">
              {format(date, "MMMM d, yyyy")}
            </DialogTitle>
            <p className="mt-1 text-xs text-neutral-400">
              Daily Performance Review
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-1 text-xs">
              <span className="text-neutral-400">Net P/L</span>
              <span
                className={cn(
                  "font-semibold",
                  netPL >= 0 ? "text-emerald-400" : "text-red-400"
                )}
              >
                {fmtUsd(netPL)}
              </span>
            </div>
          </div>
        </header>

        {/* METRIC TILES */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 pt-4 pb-3">
          <MetricCard label="Net P/L">
            <span
              className={cn(
                "text-lg font-semibold",
                netPL >= 0 ? "text-emerald-400" : "text-red-400"
              )}
            >
              {fmtUsd(netPL)}
            </span>
          </MetricCard>

          <MetricCard label="Trades">
            <span className="text-lg font-semibold">{tradeCount}</span>
          </MetricCard>

          <MetricCard label="Win Rate">
            <span className="text-lg font-semibold">{winRate.toFixed(0)}%</span>
          </MetricCard>

          <MetricCard label="Max Margin">
            <span className="text-lg font-semibold">
              ${maxMargin.toLocaleString()}
            </span>
          </MetricCard>
        </section>

        {/* TABLE */}
        <section className="px-6 pb-5 pt-2">
          <div className="rounded-xl border border-neutral-800 bg-[#050608] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-neutral-900/70 border-neutral-800">
                  <TableHead className="w-[96px] text-xs font-medium text-neutral-400">
                    Time
                  </TableHead>
                  <TableHead className="w-[170px] text-xs font-medium text-neutral-400">
                    Strategy
                  </TableHead>
                  <TableHead className="text-xs font-medium text-neutral-400">
                    Legs
                  </TableHead>
                  <TableHead className="w-[130px] text-right text-xs font-medium text-neutral-400">
                    Premium
                  </TableHead>
                  <TableHead className="w-[110px] text-right text-xs font-medium text-neutral-400">
                    Margin
                  </TableHead>
                  <TableHead className="w-[110px] text-right text-xs font-medium text-neutral-400">
                    P/L
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-6 text-center text-neutral-500"
                    >
                      No trades recorded for this day.
                    </TableCell>
                  </TableRow>
                )}

                {trades.map((t, idx) => {
                  const time =
                    t.dateOpened != null
                      ? format(new Date(t.dateOpened), "HH:mm:ss")
                      : "--:--:--";

                  return (
                    <TableRow
                      key={t.id ?? idx}
                      className="border-neutral-800 hover:bg-neutral-900/60"
                    >
                      {/* Time */}
                      <TableCell className="font-mono text-xs text-neutral-400 whitespace-nowrap">
                        {time}
                      </TableCell>

                      {/* Strategy */}
                      <TableCell className="text-xs">
                        <span className="inline-flex items-center rounded-full bg-neutral-900 px-2 py-[2px] text-[11px] font-medium text-neutral-200">
                          {t.strategy || "Custom"}
                        </span>
                      </TableCell>

                      {/* Legs */}
                      <TableCell
                        className="text-xs text-neutral-300 max-w-[360px] truncate"
                        title={t.legs}
                      >
                        {t.legs}
                      </TableCell>

                      {/* Premium */}
                      <TableCell className="text-right font-mono text-xs tabular-nums text-neutral-200 whitespace-nowrap">
                        {fmtUsd(t.premium)}
                      </TableCell>

                      {/* Margin */}
                      <TableCell className="text-right font-mono text-xs tabular-nums text-neutral-200 whitespace-nowrap">
                        ${t.margin.toLocaleString()}
                      </TableCell>

                      {/* P/L */}
                      <TableCell
                        className={cn(
                          "text-right font-mono text-xs tabular-nums whitespace-nowrap",
                          t.pl >= 0 ? "text-emerald-400" : "text-red-400"
                        )}
                      >
                        {fmtUsd(t.pl)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}

function MetricCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 px-4 py-3 flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-wide text-neutral-400">
        {label}
      </span>
      {children}
    </div>
  );
}
