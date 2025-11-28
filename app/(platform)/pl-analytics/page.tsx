"use client";

import { useEffect, useMemo, useState } from "react";

import { AvgPLDashboard } from "@/components/analytics/AvgPLDashboard";
import { CapitalSimPanel } from "@/components/tp-optimizer/CapitalSimPanel";
import { NoActiveBlock } from "@/components/no-active-block";
import { WorkspaceShell } from "@/components/workspace-shell";
import { MissedProfitTrade } from "@/lib/analytics/missed-profit-analyzer";
import { getTradesByBlockWithOptions } from "@/lib/db";
import { Trade } from "@/lib/models/trade";
import { useBlockStore } from "@/lib/stores/block-store";

export default function PlAnalyticsPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const activeBlock = useBlockStore((state) => {
    const activeBlockId = state.activeBlockId;
    return activeBlockId
      ? state.blocks.find((block) => block.id === activeBlockId)
      : null;
  });
  const isInitialized = useBlockStore((state) => state.isInitialized);
  const loadBlocks = useBlockStore((state) => state.loadBlocks);

  useEffect(() => {
    if (!isInitialized) {
      loadBlocks().catch(console.error);
    }
  }, [isInitialized, loadBlocks]);

  useEffect(() => {
    async function fetchData() {
      if (!activeBlock) {
        setTrades([]);
        return;
      }

      setIsLoadingData(true);
      try {
        const fetchedTrades = await getTradesByBlockWithOptions(activeBlock.id);
        setTrades(fetchedTrades);
      } catch (error) {
        console.error("Failed to fetch trades:", error);
      } finally {
        setIsLoadingData(false);
      }
    }

    fetchData();
  }, [activeBlock]);

  const missedProfitTrades = useMemo<MissedProfitTrade[]>(() => {
    return trades.map((t, idx) => {
      const premiumUsed = Math.abs(t.premium || 0);
      const plDollar = t.pl || 0;
      const plPercent = premiumUsed > 0 ? (plDollar / premiumUsed) * 100 : 0;
      const maxProfitPct =
        premiumUsed > 0 && typeof t.maxProfit === "number"
          ? (t.maxProfit / premiumUsed) * 100
          : 0;
      const maxLossPct =
        premiumUsed > 0 && typeof t.maxLoss === "number"
          ? (t.maxLoss / premiumUsed) * 100
          : undefined;

      return {
        id: t.timeOpened ? `${t.dateOpened}-${t.timeOpened}` : idx,
        premiumUsed,
        plDollar,
        plPercent,
        maxProfitPct,
        maxLossPct,
        strategyName: t.strategy,
        openedOn: t.dateOpened,
        closedOn: t.dateClosed,
        // additional fields consumed by the capital simulator for starting balance and sizing
        // but safe to carry on the MissedProfitTrade shape
        fundsAtClose: t.fundsAtClose,
        numContracts: t.numContracts,
        marginReq: t.marginReq,
        premium: t.premium,
      } as MissedProfitTrade;
    });
  }, [trades]);

  return (
    <WorkspaceShell
      title="P/L Analytics"
      label="New"
      description="Average P/L statistics and monthly withdrawal simulator."
    >
      {!activeBlock ? (
        <NoActiveBlock />
      ) : isLoadingData ? (
        <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">Loading trades...</p>
        </div>
      ) : trades.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          No trades available for this block yet.
        </div>
      ) : (
        <div className="space-y-6">
          <AvgPLDashboard trades={trades} />
          <CapitalSimPanel trades={missedProfitTrades} />
        </div>
      )}
    </WorkspaceShell>
  );
}
