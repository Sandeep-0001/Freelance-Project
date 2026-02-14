import bcrypt from "bcryptjs";

export async function hashPassword(plainText: string) {
  // Increased cost factor for better security
  // 12 provides strong protection against brute-force attacks while maintaining reasonable performance
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plainText, salt);
}

export async function verifyPassword(plainText: string, passwordHash: string) {
  return bcrypt.compare(plainText, passwordHash);
}
