"use client";

import Link from "next/link";
import { useEffect, useState, createContext, useContext, useMemo } from "react";
import { apiFetch } from "@/lib/apiClient";
import { ChevronDown, ChevronRight, Network } from "lucide-react";

type TreeNode = {
  id: string;
  email: string;
  referralCode: string;
  children: TreeNode[];
};

// Context to manage collapsed state across the entire tree
const CollapsedContext = createContext<{
  collapsedNodes: Set<string>;
  toggleNode: (nodeId: string) => void;
}>({
  collapsedNodes: new Set(),
  toggleNode: () => {},
});

function useCollapsedState() {
  return useContext(CollapsedContext);
}

function NodeView({ node, depth }: { node: TreeNode; depth: number }) {
  const { collapsedNodes, toggleNode } = useCollapsedState();
  const isCollapsed = collapsedNodes.has(node.id);

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow-md">
        <span className="rounded-xl bg-gradient-to-r from-emerald-600 to-sky-600 px-3 py-1 text-xs font-extrabold text-white shadow">
          Level {depth}
        </span>

        <span className="text-sm font-bold text-zinc-900">{node.email}</span>

        <span className="text-xs rounded-xl border border-sky-200 bg-sky-50 px-2.5 py-1 font-mono font-semibold text-sky-800">
          {node.referralCode}
        </span>

        {node.children.length > 0 && (
          <button
            onClick={() => toggleNode(node.id)}
            type="button"
            className="ml-auto inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-extrabold text-zinc-700 transition hover:bg-zinc-100"
          >
            {isCollapsed ? (
              <>
                <ChevronRight className="h-3 w-3" />
                Expand {node.children.length}
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                Collapse {node.children.length}
              </>
            )}
          </button>
        )}
      </div>

      {node.children.length > 0 && !isCollapsed ? (
        <div className="ml-6 mt-3 border-l-2 border-zinc-200 pl-6">
          {node.children.map((c) => (
            <NodeView key={c.id} node={c} depth={depth + 1} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function ReferralsPage() {
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());

  const toggleNode = (nodeId: string) => {
    setCollapsedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    apiFetch("/api/referrals?depth=5")
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json?.error ?? "Failed to load");
        setTree(json.tree);
      })
      .catch((e) => setError(String(e?.message ?? e)));
  }, []);

  const contextValue = useMemo(
    () => ({
      collapsedNodes,
      toggleNode,
    }),
    [collapsedNodes]
  );

  return (
    <CollapsedContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-zinc-50">
        <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600" />

        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/70 px-3 py-1.5 shadow-sm backdrop-blur">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-sky-600 text-white">
                  <Network className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold text-zinc-800">Referral Network</span>
              </div>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
                Referral Network
              </h1>
              <p className="mt-2 text-sm text-zinc-600">
                Visualize your binary tree structure and network growth.
              </p>
            </div>

            <Link
              className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-extrabold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
              prefetch={false}
              href="/dashboard"
            >
              ← Back to Dashboard
            </Link>
          </div>

          {error ? (
            <div className="mb-6 rounded-2xl border border-red-200 bg-white p-4 text-sm font-semibold text-red-700 shadow-sm">
              ⚠️ {error}
            </div>
          ) : null}

          {tree ? (
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-sky-50 border border-emerald-100">
                  <Network className="h-5 w-5 text-emerald-700" />
                </div>
                <h2 className="text-lg font-extrabold text-zinc-900">Your Network Tree</h2>
              </div>

              <NodeView node={tree} depth={0} />

              <div className="mt-8 flex items-start gap-3 border-t border-zinc-200 pt-6">
                <span className="text-2xl">ℹ</span>
                <p className="text-xs text-zinc-600">
                  <strong>Note:</strong> This view shows up to 5 levels of your referral network for optimal
                  performance. Each level represents a generation in your binary tree structure. Click
                  &ldquo;Collapse&rdquo; or &ldquo;Expand&rdquo; to manage tree visibility.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-zinc-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-sky-100 text-4xl">
                🌟
              </div>
              <p className="text-sm font-semibold text-zinc-600">Loading your network...</p>
            </div>
          )}
        </div>
      </div>
    </CollapsedContext.Provider>
  );
}
