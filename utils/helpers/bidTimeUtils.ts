/**
 * แปลง string เวลาที่เหลือของการประมูลเป็นมิลลิวินาที
 * รองรับ 2 รูปแบบ: "HH:MM:SS" (เช่น "02:30:00") และ "Xd Yh Zm" (เช่น "1d 5h 30m")
 * คืนค่า Infinity ถ้า parse ไม่ได้ (ป้องกันการแจ้งเตือนผิดพลาดเมื่อข้อมูลไม่สมบูรณ์)
 */
export function parseRemainingMs(timeLeft: string): number {
  if (!timeLeft) return Infinity;

  const hhmmss = timeLeft.match(/^(\d+):(\d+):(\d+)$/);
  if (hhmmss) {
    return (
      parseInt(hhmmss[1]) * 3600_000 +
      parseInt(hhmmss[2]) * 60_000 +
      parseInt(hhmmss[3]) * 1000
    );
  }

  const dmh = timeLeft.match(/(\d+)d\s+(\d+)h\s+(\d+)m/);
  if (dmh) {
    return (
      parseInt(dmh[1]) * 86400_000 +
      parseInt(dmh[2]) * 3600_000 +
      parseInt(dmh[3]) * 60_000
    );
  }

  return Infinity;
}
