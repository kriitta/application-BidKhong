import { parseRemainingMs } from "../utils/helpers/bidTimeUtils";

describe("parseRemainingMs", () => {
  test("แปลงรูปแบบ HH:MM:SS ได้ถูกต้อง", () => {
    expect(parseRemainingMs("02:30:00")).toBe(2 * 3600_000 + 30 * 60_000);
  });

  test("แปลงรูปแบบ HH:MM:SS ที่เป็น 00:00:00 ได้ 0", () => {
    expect(parseRemainingMs("00:00:00")).toBe(0);
  });

  test("แปลงรูปแบบ Xd Yh Zm ได้ถูกต้อง", () => {
    expect(parseRemainingMs("1d 5h 30m")).toBe(
      86400_000 + 5 * 3600_000 + 30 * 60_000
    );
  });

  test("แปลงรูปแบบ Xd Yh Zm ที่ทุกค่าเป็น 0", () => {
    expect(parseRemainingMs("0d 0h 0m")).toBe(0);
  });

  test("string ว่างต้องคืนค่า Infinity", () => {
    expect(parseRemainingMs("")).toBe(Infinity);
  });

  test("รูปแบบที่ไม่ตรงเลย ต้องคืนค่า Infinity", () => {
    expect(parseRemainingMs("ไม่ทราบเวลา")).toBe(Infinity);
  });

  test("รูปแบบครึ่งเดียว (ไม่ครบ HH:MM:SS) ต้องคืนค่า Infinity", () => {
    expect(parseRemainingMs("02:30")).toBe(Infinity);
  });

  test("รูปแบบ Xd Yh Zm ที่ไม่มี m ต้องคืนค่า Infinity (regex ไม่ match)", () => {
    expect(parseRemainingMs("1d 5h")).toBe(Infinity);
  });

  test("HH:MM:SS ที่มีตัวเลขหลักเดียว ต้องแปลงได้ถูกต้อง", () => {
    expect(parseRemainingMs("1:5:3")).toBe(3600_000 + 5 * 60_000 + 3000);
  });
});
