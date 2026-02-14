import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { findBinaryPlacement } from "@/lib/binaryPlacement";
import { UserModel } from "@/models/User";

export type ReferralTreeNode = {
  id: string;
  name: string;
  email: string | null;
  referralCode: string;
  position?: "left" | "right" | null;
  children: ReferralTreeNode[];
};

function asObjectId(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid userId");
  }
  return new mongoose.Types.ObjectId(id);
}

/**
 * Assigns a parent/upline to an existing user by looking up the parent via referralCode.
 *
 * Rules:
 * - Parent is identified via referralCode
 * - Store parentUserId in the child user (User.parent)
 * - Prevent circular references (child cannot become an ancestor of itself)
 */
export async function assignParentByReferralCode(options: {
  childUserId: string;
  parentReferralCode: string;
  session?: mongoose.ClientSession;
}) {
  await connectToDatabase();

  const session = options.session;
  const childId = asObjectId(options.childUserId);

  const child = await UserModel.findById(childId).session(session ?? null);
  if (!child) throw new Error("Child user not found");

  const parent = await UserModel.findOne({ referralCode: options.parentReferralCode })
    .select("_id parent")
    .session(session ?? null);

  if (!parent) throw new Error("Invalid referral code");
  if (parent._id.equals(child._id)) throw new Error("Circular reference detected");

  // Cycle prevention: walk up from the proposed parent to the root.
  // If we ever encounter the child, assigning would create a cycle.
  let cursorId: mongoose.Types.ObjectId | null = parent._id;
  let steps = 0;
  const MAX_STEPS = 50_000; // safety cap for pathological/corrupt graphs

  while (cursorId) {
    if (cursorId.equals(child._id)) {
      throw new Error("Circular reference detected");
    }

    if (steps++ > MAX_STEPS) {
      throw new Error("Referral chain too deep or corrupt");
    }

    const cursor = await UserModel.findById(cursorId)
      .select("parent")
      .session(session ?? null);

    cursorId = cursor?.parent ? new mongoose.Types.ObjectId(cursor.parent) : null;
  }

  child.parent = parent._id;

  // Place the user in the binary tree under the referred user.
  const placement = await findBinaryPlacement({ sponsorId: parent._id, session });
  child.parent = placement.parentId;
  child.position = placement.position;

  await child.save(session ? { session } : undefined);

  return {
    childUserId: child._id.toString(),
    parentUserId: placement.parentId.toString(),
    position: placement.position,
  };
}

/**
 * Builds a referral tree up to `depth` levels using an iterative BFS.
 * This avoids deep recursion and uses one DB query per level.
 */
export async function buildReferralTree(options: {
  rootUserId: string;
  depth: number;
  session?: mongoose.ClientSession;
}): Promise<ReferralTreeNode> {
  await connectToDatabase();

  const rootId = asObjectId(options.rootUserId);
  const depth = Math.max(0, Math.floor(options.depth));
  const session = options.session;

  const rootUser = await UserModel.findById(rootId)
    .select("name email referralCode")
    .session(session ?? null);

  if (!rootUser) throw new Error("User not found");

  const root: ReferralTreeNode = {
    id: rootUser._id.toString(),
    name: rootUser.name ?? "",
    email: rootUser.email ?? null,
    referralCode: rootUser.referralCode,
    position: null,
    children: [],
  };

  let frontier: ReferralTreeNode[] = [root];

  for (let level = 1; level <= depth; level++) {
    const parentIds = frontier.map((n) => new mongoose.Types.ObjectId(n.id));
    if (parentIds.length === 0) break;

    const children = await UserModel.find({ parent: { $in: parentIds } })
      .select("name email referralCode parent position")
      .lean()
      .session(session ?? null);

    if (children.length === 0) break;

    const byParent = new Map<string, ReferralTreeNode[]>();
    for (const child of children) {
      const parentId = child.parent?.toString();
      if (!parentId) continue;

      const childNode: ReferralTreeNode = {
        id: child._id.toString(),
        name: (child as { name?: string }).name ?? "",
        email: child.email ?? null,
        referralCode: child.referralCode,
        position: (child as { position?: "left" | "right" | null }).position ?? null,
        children: [],
      };

      const list = byParent.get(parentId) ?? [];
      list.push(childNode);
      byParent.set(parentId, list);
    }

    const next: ReferralTreeNode[] = [];
    for (const parentNode of frontier) {
      const kids = byParent.get(parentNode.id) ?? [];

      // Keep binary ordering stable: left then right.
      // For legacy records without position, push them to the end.
      const posRank = (p: ReferralTreeNode["position"]) => (p === "left" ? 0 : p === "right" ? 1 : 2);
      kids.sort((a, b) => posRank(a.position) - posRank(b.position));
      parentNode.children = kids;
      next.push(...kids);
    }

    frontier = next;
  }

  return root;
}
