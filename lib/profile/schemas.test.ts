import { expect, test } from "bun:test";
import { avatarSchema, passwordSchema, profileSchema } from "./schemas";

test("profile: blanks become null, bad phone rejected", () => {
  expect(profileSchema.parse({ name: " สมชาย ", phone: "", organization: "", position: "" })).toEqual({ name: "สมชาย", phone: null, organization: null, position: null });
  expect(profileSchema.safeParse({ name: "a", phone: "abc", organization: "", position: "" }).success).toBe(false);
  expect(profileSchema.safeParse({ name: "", phone: "", organization: "", position: "" }).success).toBe(false);
  expect(profileSchema.parse({ name: "a", phone: "081-234 5678", organization: "", position: "" }).phone).toBe("081-234 5678");
});

test("password: min length and confirm must match", () => {
  expect(passwordSchema.safeParse({ password: "12345678", confirm: "12345678" }).success).toBe(true);
  expect(passwordSchema.safeParse({ password: "1234567", confirm: "1234567" }).success).toBe(false);
  expect(passwordSchema.safeParse({ password: "12345678", confirm: "12345679" }).success).toBe(false);
});

test("avatar: only jpeg data URL within size, null allowed", () => {
  expect(avatarSchema.safeParse("data:image/jpeg;base64,/9j/4AAQSkZJRg==").success).toBe(true);
  expect(avatarSchema.safeParse(null).success).toBe(true);
  expect(avatarSchema.safeParse("data:image/svg+xml;base64,PHN2Zz4=").success).toBe(false);
  expect(avatarSchema.safeParse("https://evil.example/a.jpg").success).toBe(false);
  expect(avatarSchema.safeParse("data:image/jpeg;base64," + "A".repeat(150_000)).success).toBe(false);
});
