"use client";

import { useState, FormEvent } from "react";

// กำหนดโครงสร้างข้อมูลของฟอร์มแต่ละชุด
interface FormEntry {
  id: string;
  name: string;
  email: string;
}

export default function SimpleDynamicMultiStepForm() {
  // --- 1. การตั้งค่า State ---

  // State จัดการหน้าจอ: 'select_count' (เลือกจำนวน) หรือ 'fill_forms' (กรอกข้อมูล)
  const [stage, setStage] = useState<"select_count" | "fill_forms">(
    "select_count"
  );

  // State เก็บจำนวนฟอร์มที่ผู้ใช้ต้องการ
  const [formCount, setFormCount] = useState<number>(1);

  // State เก็บข้อมูลของทุกฟอร์มในรูปแบบ Array
  const [forms, setForms] = useState<FormEntry[]>([]);

  // State เป็นตัวชี้ว่ากำลังกรอกฟอร์มชุดที่เท่าไหร่ (index ของ Array)
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // --- 2. ฟังก์ชันจัดการ Logic ---

  // เมื่อกดปุ่ม "เริ่มต้น"
  const handleStart = () => {
    // สร้าง Array ของฟอร์มเปล่าๆ ตามจำนวนที่กำหนด
    const newForms = Array.from({ length: formCount }, () => ({
      id: crypto.randomUUID(),
      name: "",
      email: "",
    }));
    setForms(newForms);
    setCurrentIndex(0); // เริ่มที่ฟอร์มแรกเสมอ
    setStage("fill_forms"); // เปลี่ยนหน้าจอไปที่หน้ากรอกข้อมูล
  };

  // เมื่อมีการพิมพ์ในช่อง input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // สร้างสำเนาของ Array (หลักการ Immutability)
    const newForms = [...forms];
    // อัปเดตข้อมูลในฟอร์มชุดปัจจุบัน (currentIndex)
    newForms[currentIndex] = {
      ...newForms[currentIndex],
      [name]: value,
    };
    setForms(newForms);
  };

  // เมื่อกดปุ่ม "ถัดไป"
  const handleNext = () => {
    if (currentIndex < forms.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // เมื่อกดปุ่ม "ย้อนกลับ"
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // เมื่อกดส่งข้อมูลในฟอร์มสุดท้าย
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Final form data:", forms);
    alert("ส่งข้อมูลสำเร็จ! ดูใน Console Log");
    // กลับไปหน้าเลือกจำนวน
    setStage("select_count");
    setForms([]);
  };

  // --- 3. ส่วนแสดงผล (JSX) ---
  return (
    <div className="max-w-lg mx-auto my-10 p-8 bg-white rounded-2xl shadow-xl">
      {/* --- หน้าจอที่ 1: เลือกจำนวน --- */}
      {stage === "select_count" && (
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">สร้างฟอร์มแบบไดนามิก</h1>
          <label
            htmlFor="formCount"
            className="block font-medium text-gray-700 mb-2"
          >
            คุณต้องการกรอกข้อมูลกี่ชุด?
          </label>
          <input
            type="number"
            id="formCount"
            min="1"
            value={formCount}
            onChange={(e) => setFormCount(Number(e.target.value))}
            className="w-32 p-2 border border-gray-300 rounded-md text-center text-lg"
          />
          <button
            onClick={handleStart}
            className="w-full mt-6 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
          >
            เริ่มต้น
          </button>
        </div>
      )}

      {/* --- หน้าจอที่ 2: กรอกข้อมูลทีละขั้นตอน --- */}
      {stage === "fill_forms" && (
        <form onSubmit={handleSubmit}>
          {/* Progress Indicator */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold">
              กรอกข้อมูลชุดที่ {currentIndex + 1}
            </h2>
            <p className="text-sm text-gray-500">
              (ขั้นตอนที่ {currentIndex + 1} จาก {formCount})
            </p>
          </div>

          {/* Form Fields: แสดงเฉพาะฟอร์มของ currentIndex */}
          <div className="space-y-4 mb-8">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                ชื่อ-นามสกุล
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={forms[currentIndex]?.name || ""}
                onChange={handleInputChange}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                อีเมล
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={forms[currentIndex]?.email || ""}
                onChange={handleInputChange}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            {/* ปุ่ม "ย้อนกลับ" จะแสดงเมื่อไม่ใช่ขั้นตอนแรก */}
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-6 py-2 bg-gray-300 rounded-md disabled:opacity-50"
            >
              ย้อนกลับ
            </button>

            {/* ถ้ายังไม่ใช่ขั้นตอนสุดท้าย ให้แสดงปุ่ม "ถัดไป" */}
            {currentIndex < formCount - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-md"
              >
                ถัดไป
              </button>
            ) : (
              // ถ้าเป็นขั้นตอนสุดท้าย ให้แสดงปุ่ม "ส่งข้อมูล"
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white font-bold rounded-md"
              >
                ส่งข้อมูล
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
