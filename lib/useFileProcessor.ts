"use client";
import { useState, useCallback } from "react";
import { saveRecentFile } from "@/lib/idb";

interface ProcessorOptions {
  tool: string;
  fileName?: string;
}

export function useFileProcessor({ tool, fileName }: ProcessorOptions) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const process = useCallback(async (fn: () => Promise<{ size?: number; message?: string }>) => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setSuccess(null);
    try {
      const result = await fn();
      setProgress(100);
      setSuccess(result.message || "Done!");
      await saveRecentFile({
        tool, fileName: fileName || "unknown",
        fileSize: 0, resultSize: result.size,
        timestamp: Date.now(), status: "success",
      });
    } catch (e: unknown) {
      setError((e as Error).message || "Something went wrong.");
      await saveRecentFile({
        tool, fileName: fileName || "unknown",
        fileSize: 0, timestamp: Date.now(), status: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [tool, fileName]);

  return { isProcessing, progress, stage, setStage, setProgress, error, success, process };
}
