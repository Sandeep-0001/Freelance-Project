import mongoose from "mongoose";
import { UserModel } from "@/models/User";

export type BinaryPosition = "left" | "right";

function pickMissingPosition(existing: Set<string>): BinaryPosition | null {
  if (!existing.has("left")) return "left";
  if (!existing.has("right")) return "right";
  return null;
}

/**
 * Finds the next available binary placement under `sponsorId`.
 * Optimized version with better database queries and early termination.
 *
 * Order:
 * - Top to bottom (BFS) 
 * - Left to right (check left slot before right slot)
 */
export async function findBinaryPlacement(options: {
  sponsorId: mongoose.Types.ObjectId;
  session?: mongoose.ClientSession;
}): Promise<{ parentId: mongoose.Types.ObjectId; position: BinaryPosition }> {
  const session = options.session;

  const queue: mongoose.Types.ObjectId[] = [options.sponsorId];
  const visited = new Set<string>();
  const MAX_VISITS = 50_000; // Reduced limit for safety

  while (queue.length > 0) {
    const parentId = queue.shift()!;
    const key = parentId.toString();
    if (visited.has(key)) continue;
    visited.add(key);

    if (visited.size > MAX_VISITS) {
      throw new Error("Binary placement search exceeded safe limit");
    }

    // Optimized: Get all children in one query with only needed fields
    const children = await UserModel.find({ parent: parentId })
      .select("position")
      .lean()
      .session(session ?? null);

    const positions = new Set<string>();
    const childIds: mongoose.Types.ObjectId[] = [];

    for (const child of children) {
      const pos = (child as { position?: string | null }).position;
      if (pos) {
        positions.add(pos);
        childIds.push(child._id as mongoose.Types.ObjectId);
      }
    }

    // Check if we have an available slot
    const missing = pickMissingPosition(positions);
    if (missing) {
      return { parentId, position: missing };
    }

    // Queue children for next level (left first, then right)
    // Note: We don't need to fetch full documents, just IDs
    const leftChild = children.find(c => c.position === "left");
    const rightChild = children.find(c => c.position === "right");
    
    if (leftChild) queue.push(leftChild._id as mongoose.Types.ObjectId);
    if (rightChild) queue.push(rightChild._id as mongoose.Types.ObjectId);
  }

  // Should be unreachable because sponsor always has an available spot eventually.
  throw new Error("Unable to find binary placement");
}
