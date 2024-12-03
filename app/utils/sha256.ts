import * as CryptoJS from "crypto-js";

const key = "PERSONAL_HEALTH_CONSULTANT_QA_KEY";

export function encrypt(text: string): string {
  const encrypted = CryptoJS.HmacSHA256(text, key).toString();
  return encrypted;
}
