import React from "react";
import { render } from "@testing-library/react-native";
import { AppText } from "../app/components/appText";

describe("AppText widget", () => {
  test("แสดงข้อความภาษาอังกฤษได้ถูกต้อง", async () => {
    const { getByText } = await render(<AppText>Hello World</AppText>);
    expect(getByText("Hello World")).toBeTruthy();
  });

  test("แสดงข้อความภาษาไทยได้ถูกต้อง", async () => {
    const { getByText } = await render(<AppText>สวัสดีครับ</AppText>);
    expect(getByText("สวัสดีครับ")).toBeTruthy();
  });

  test("ใช้ font weight bold ตามที่ระบุ (ตรวจผ่าน style ที่ถูก apply)", async () => {
    const { getByText } = await render(<AppText weight="bold">Bold Text</AppText>);
    const element = getByText("Bold Text");
    const flatStyle = Array.isArray(element.props.style)
      ? Object.assign({}, ...element.props.style)
      : element.props.style;
    expect(flatStyle.fontFamily).toBe("Poppins_700Bold");
  });

  test("ข้อความไทยต้องใช้ font ตระกูล NotoSansThai ไม่ใช่ Poppins", async () => {
    const { getByText } = await render(<AppText weight="medium">ทดสอบ</AppText>);
    const element = getByText("ทดสอบ");
    const flatStyle = Array.isArray(element.props.style)
      ? Object.assign({}, ...element.props.style)
      : element.props.style;
    expect(flatStyle.fontFamily).toBe("NotoSansThai_500Medium");
  });
});
