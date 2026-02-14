import { UserModel } from "@/models/User";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // avoids ambiguous chars

function randomCode(length: number) {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

export async function generateUniqueReferralCode(length = 8) {
  // Optimized: Use fewer attempts and better randomization
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode(length);
    const exists = await UserModel.exists({ referralCode: code });
    if (!exists) return code;
  }
  
  // If we still can't find a unique code, try with longer length
  const longerCode = randomCode(length + 2);
  const exists = await UserModel.exists({ referralCode: longerCode });
  if (!exists) return longerCode;
  
  throw new Error("Unable to generate unique referral code");
}
