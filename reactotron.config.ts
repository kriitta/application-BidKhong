import AsyncStorage from "@react-native-async-storage/async-storage";
import Reactotron from "reactotron-react-native";

// ============================================================
// 🔧 Reactotron Configuration
// ============================================================
// เปิด Reactotron Desktop App → รัน app → จะเชื่อมต่ออัตโนมัติ
//
// ใช้งาน:
//   console.tron.log("message")
//   console.tron.display({ name: "API", value: data })
//   console.tron.warn("warning!")
//   console.tron.error("error!", stack)
// ============================================================

const reactotron = Reactotron.setAsyncStorageHandler!(AsyncStorage)
  .configure({
    name: "BidKhong", // ชื่อที่แสดงใน Reactotron Desktop
  })
  .useReactNative({
    asyncStorage: { ignore: ["secret"] }, // ดู AsyncStorage ทั้งหมด (ยกเว้น key ที่ ignore)
    networking: {
      ignoreUrls: /symbolicate|generate_204/, // ไม่ log URL พวกนี้
    },
    errors: { veto: () => false }, // แสดง error ทั้งหมด
    overlay: false,
  })
  .connect(); // เชื่อมต่อ Reactotron Desktop

// ============================================================
// 🎯 เพิ่ม console.tron ให้ใช้ได้ทั่ว app
// ============================================================
declare global {
  interface Console {
    tron: typeof Reactotron;
  }
}

console.tron = reactotron;

export default reactotron;
