"use client";

import { useEffect, useState } from "react";

import { AvgPLDashboard } from "@/components/analytics/AvgPLDashboard";
import { NoActiveBlock } from "@/components/no-active-block";
import { WorkspaceShell } from "@/components/workspace-shell";
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

  if (!activeBlock) {
    return <NoActiveBlock />;
  }

  return (
    <WorkspaceShell
      title="P/L Analytics"
      label="New"
      description="Average P/L statistics and monthly withdrawal simulator."
    >
      {isLoadingData ? (
        <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">Loading trades...</p>
        </div>
      ) : (
        <AvgPLDashboard trades={trades} />
      )}
    </WorkspaceShell>
  );
}
