"use client";

import { useParams } from "next/navigation";
import { getCookie } from "cookies-next";
import { ProfileInterface } from "@/app/interface/ProfileInterface";
import { useEffect, useState, FormEvent, useCallback } from "react";
import { getAuthHeaders } from "@/app/component/Headers";
import axios from "axios";
import { campaignsInterface } from "@/app/interface/campaignsInterface";
import Image from "next/image";
import Swal from "sweetalert2";

interface FormEntry {
  id: string;
  name: string;
  birthdate: string;
  birthmonth: string;
  birthyear: string;
  birthtime: string;
  birthconstellation: string;
  age: string;
  wish: string;
  many_names: string;
}

export default function CampaignPage() {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileInterface | null>(null);
  const [campaign, setCampaign] = useState<campaignsInterface | null>();
  const [step, setStep] = useState(1);
  const [stage, setStage] = useState<"select_count" | "fill_forms">(
    "select_count"
  );
  const [formCount, setFormCount] = useState<number>(1);
  const [forms, setForms] = useState<FormEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [oldDonation, setOldDonation] = useState<FormEntry[]>();
  const [image, setImage] = useState<File | null>();

  const fetchcampaign = useCallback(async () => {
    try {
      const url =
        process.env.NEXT_PUBLIC_API_URL + "/donation/campaigndetails/" + id;
      const headers = getAuthHeaders();
      const campaigns = await axios.get(url, { headers });

      if (campaigns.status === 200) {
        setIsLoading(false);
        setCampaign(campaigns.data);
      }
    } catch (error: unknown) {
      const e = error as Error;
      setIsLoading(false);

      console.log(e.message);
    }
  }, [id]);

  const fetchOldDonation = async () => {
    try {
      let url =
        process.env.NEXT_PUBLIC_API_URL +
        `/donation/previous/${profile?.userId}`;
      if (campaign?.formDetails === "fullName") {
        url =
          process.env.NEXT_PUBLIC_API_URL +
          `/donation/previousfullname/${profile?.userId}`;
      } else if (campaign?.formDetails === "fullName_BirthDay") {
        url =
          process.env.NEXT_PUBLIC_API_URL +
          `/donation/previous/${profile?.userId}`;
      }

      const headers = getAuthHeaders();

      const Old = await axios.get(url, { headers });

      if (Old.status === 200) {
        setIsLoading(false);
        setOldDonation(Old.data.campaign_transactions);
      }
    } catch (error: unknown) {
      const e = error as Error;

      console.log(e.message);
    }
  };

  useEffect(() => {
    const userProfile = getCookie("profile");
    setProfile(JSON.parse(userProfile?.toString() || "{}"));
    fetchcampaign();
  }, [fetchcampaign]);

  const nextStep = () => setStep(step === 4 ? 4 : step + 1);
  const prevStep = () => setStep(step === 1 ? 1 : step - 1);

  useEffect(() => {
    if (step === 4) {
      const timer = setTimeout(() => {
        window.location.href = "/";
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  if (isLoading == true) {
    return (
      <div className="flex w-full h-screen justify-center items-center">
        <span className="loading loading-spinner loading-xl text-white"></span>
      </div>
    );
  }

  const handleStart = () => {
    // สร้าง Array ของฟอร์มเปล่าๆ ตามจำนวนที่กำหนด
    const newForms = Array.from({ length: formCount }, () => ({
      id: crypto.randomUUID(),
      name: "",
      birthdate: "",
      birthmonth: "",
      birthyear: "",
      birthtime: "",
      birthconstellation: "",
      age: "",
      wish: "",
      many_names: "",
    }));
    setForms(newForms);
    setCurrentIndex(0);
    nextStep();
    setStage("fill_forms"); // เปลี่ยนหน้าจอไปที่หน้ากรอกข้อมูล
  };

  const modalOldDonation = () => {
    fetchOldDonation();
    const modal = document.getElementById(
      "modalOldDonation"
    ) as HTMLDialogElement | null;
    modal?.showModal();
  };

  const handleSeleted = async (old: FormEntry) => {
    if (campaign?.formDetails === "fullName") {
      const newForms = [...forms];
      // อัปเดตข้อมูลในฟอร์มชุดปัจจุบัน (currentIndex)
      newForms[currentIndex] = {
        ...newForms[currentIndex],
        name: old.name,
      };

      const modal = document.getElementById(
        "modalOldDonation"
      ) as HTMLDialogElement | null;
      modal?.close();
      setForms(newForms);
    } else if (campaign?.formDetails === "fullName_BirthDay") {
      const newForms = [...forms];
      // อัปเดตข้อมูลในฟอร์มชุดปัจจุบัน (currentIndex)
      newForms[currentIndex] = {
        ...newForms[currentIndex],
        name: old.name,
        birthdate: old.birthdate,
        birthmonth: old.birthmonth,
        birthyear: old.birthyear,
        birthtime: old.birthtime,
        birthconstellation: old.birthconstellation,
        age: old.age,
      };

      const modal = document.getElementById(
        "modalOldDonation"
      ) as HTMLDialogElement | null;
      modal?.close();
      setForms(newForms);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
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

  const modalNoti = (ReactEvent: FormEvent<HTMLFormElement>) => {
    ReactEvent.preventDefault();

    const modal = document.getElementById(
      "modalNext"
    ) as HTMLDialogElement | null;
    modal?.showModal();
  };

  const modalNext = () => {
    if (currentIndex < formCount - 1) {
      const modal = document.getElementById(
        "modalNext"
      ) as HTMLDialogElement | null;
      modal?.close();
      handleNext();
    } else {
      const modal = document.getElementById(
        "modalNext"
      ) as HTMLDialogElement | null;
      modal?.close();
      nextStep();
    }
  };

  const handleNext = () => {
    if (currentIndex < forms.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const payNoti = async () => {
    if (!image) {
      Swal.fire({
        icon: "error",
        title: "กรุณาอัปโหลดสลิป!",
        text: "กรุณาอัปโหลดสลิปหลักฐานการโอนเงิน",
        showConfirmButton: true,
        confirmButtonText: "ตกลง",
        buttonsStyling: false,
        customClass: {
          confirmButton: "py-2 px-4 bg-red-950 text-white rounded-2xl w-40",
        },
      });
      return;
    }

    handleSubmit();
  };

  const handleSubmit = async () => {
    try {
      Swal.fire({
        title: "กำลังดำเนินการ...",
        text: "กรุณารอสักครู่",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        width: "375px",
        didOpen: () => {
          Swal.showLoading();
        },
      });
      for (let i = 0; i < forms.length; i++) {
        const url = process.env.NEXT_PUBLIC_API_URL + "/donation/create";
        const headers = getAuthHeaders();
        const form = forms[i];
        const formData = new FormData();
        if (i === 0) {
          formData.append("pushmessage", "pushmessage");
        }
        formData.append("campaignId", id as string);
        formData.append("user_id", profile?.userId as string);
        formData.append("value", "1");
        formData.append("name", form.name);
        formData.append("birthdate", form.birthdate);
        formData.append("birthmonth", form.birthmonth);
        formData.append("birthyear", form.birthyear);
        formData.append("birthtime", form.birthtime);
        formData.append("birthconstellation", form.birthconstellation);
        formData.append("age", form.age);
        formData.append("wish", form.wish);
        formData.append("many_names", form.many_names);
        formData.append("image", image as Blob);
        formData.append("status", "PENDING");
        if (i === forms.length - 1) {
          formData.append("pushnoti", formCount.toString());
        }

        await axios.post(url, formData, { headers });
      }
      Swal.close();
      nextStep();
    } catch (error: unknown) {
      const e = error as Error;
      console.log(e.message);
    }
  };

  return (
    <div className=" h-full w-full overflow-hidden my-18 p-2 flex flex-col gap-2">
      <div className="crad w-full rounded-lg text-center text-xl py-4 px-1 bg-white/90">
        <ul className="steps w-full">
          <li className={`step text-xs step-success `}>เลือกจำนวน</li>
          <li
            className={`step text-xs ${
              step === 2 || step === 3 || step === 4 ? "step-success" : ""
            } `}
          >
            กรอกข้อมูล
          </li>
          <li
            className={`step text-xs ${
              step === 3 || step === 4 ? "step-success" : ""
            } `}
          >
            ชำระเงิน
          </li>
          <li className={`step text-xs ${step === 4 ? "step-success" : ""} `}>
            เสร็จสิ้น
          </li>
        </ul>
      </div>

      {step === 1 && (
        <div className="card w-full h-[70vh] flex items-center bg-white/90 rounded-lg">
          <div className="h-5/6 w-full p-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">กำหนดจำนวนกองบุญ</h1>
              <label
                htmlFor="formCount"
                className="block font-medium text-xl text-gray-700 mb-2"
              >
                จำนวนกองบุญที่ต้องการร่วมบุญ?
              </label>
              <input
                type="number"
                id="formCount"
                min="1"
                value={formCount}
                onChange={(e) => setFormCount(Number(e.target.value))}
                className="input text-center text-lg"
              />
            </div>
          </div>
          <div className="h-1/6 flex justify-between items-center gap-2">
            <button
              className="py-2 px-4 bg-red-950 text-white rounded-2xl w-40"
              onClick={handleStart}
            >
              ถัดไป
            </button>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="card w-full h-[70vh] flex items-center bg-white/90 rounded-lg">
          <div className="h-5/6 w-full p-4 overflow-hidden overflow-y-auto">
            {stage === "fill_forms" && (
              <form id={`form[${currentIndex}]`} onSubmit={modalNoti}>
                {/* Progress Indicator */}
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold">
                    กรอกข้อมูลชุดที่ {currentIndex + 1}
                  </h2>
                  <p className="text-sm text-gray-500">
                    (ชุดที่ {currentIndex + 1} จาก {formCount})
                  </p>
                </div>
                {campaign?.formDetails !== "many_Names" && (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        modalOldDonation();
                      }}
                      className="btn btn-outline btn-primary rounded-2xl mb-5"
                    >
                      เลือกจากประวัติการร่วมบุญ
                    </button>
                  </div>
                )}

                <div className="space-y-4 mb-8">
                  {campaign?.formDetails === "fullName" && (
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-lg font-medium text-gray-700"
                      >
                        ชื่อ-นามสกุล
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={forms[currentIndex]?.name || ""}
                        onChange={handleInputChange}
                        className="input text-lg"
                        required
                      />
                    </div>
                  )}
                  {campaign?.formDetails === "fullName_BirthDay" && (
                    <div>
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-lg font-medium text-gray-700"
                        >
                          ชื่อ-นามสกุล
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={forms[currentIndex]?.name || ""}
                          onChange={handleInputChange}
                          className="input text-lg"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="birthdate"
                          className="block text-lg font-medium text-gray-700"
                        >
                          วันที่
                        </label>
                        <select
                          id="birthdate"
                          name="birthdate"
                          value={forms[currentIndex]?.birthdate || ""}
                          onChange={handleInputChange}
                          className="select"
                          required
                        >
                          <option value={""} disabled={true}>
                            เลือกวันที่
                          </option>
                          <option value={"ไม่ทราบวันเกิด"}>
                            ไม่ทราบวันเกิด
                          </option>
                          <option value={"1"}>1</option>
                          <option value={"2"}>2</option>
                          <option value={"3"}>3</option>
                          <option value={"4"}>4</option>
                          <option value={"5"}>5</option>
                          <option value={"6"}>6</option>
                          <option value={"7"}>7</option>
                          <option value={"8"}>8</option>
                          <option value={"9"}>9</option>
                          <option value={"10"}>10</option>
                          <option value={"11"}>11</option>
                          <option value={"12"}>12</option>
                          <option value={"13"}>13</option>
                          <option value={"14"}>14</option>
                          <option value={"15"}>15</option>
                          <option value={"16"}>16</option>
                          <option value={"17"}>17</option>
                          <option value={"18"}>18</option>
                          <option value={"19"}>19</option>
                          <option value={"20"}>20</option>
                          <option value={"21"}>21</option>
                          <option value={"22"}>22</option>
                          <option value={"23"}>23</option>
                          <option value={"24"}>24</option>
                          <option value={"25"}>25</option>
                          <option value={"26"}>26</option>
                          <option value={"27"}>27</option>
                          <option value={"28"}>28</option>
                          <option value={"29"}>29</option>
                          <option value={"30"}>30</option>
                          <option value={"31"}>31</option>
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="birthmonth"
                          className="block text-lg font-medium text-gray-700"
                        >
                          เดือน
                        </label>
                        <select
                          id="birthmonth"
                          name="birthmonth"
                          value={forms[currentIndex]?.birthmonth || ""}
                          onChange={handleInputChange}
                          className="select"
                          required
                        >
                          <option value={""} disabled={true}>
                            เลือกเดือนเกิด
                          </option>
                          <option value={"ไม่ทราบเดือนเกิด"}>
                            ไม่ทราบเดือนเกิด
                          </option>
                          <option value={"มกราคม"}>มกราคม</option>
                          <option value={"กุมภาพันธ์"}>กุมภาพันธ์</option>
                          <option value={"มีนาคม"}>มีนาคม</option>
                          <option value={"เมษายน"}>เมษายน</option>
                          <option value={"พฤษภาคม"}>พฤษภาคม</option>
                          <option value={"มิถุนายน"}>มิถุนายน</option>
                          <option value={"กรกฎาคม"}>กรกฎาคม</option>
                          <option value={"สิงหาคม"}>สิงหาคม</option>
                          <option value={"กันยายน"}>กันยายน</option>
                          <option value={"ตุลาคม"}>ตุลาคม</option>
                          <option value={"พฤศจิกายน"}>พฤศจิกายน</option>
                          <option value={"ธันวาคม"}>ธันวาคม</option>
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="birthyear"
                          className="block text-lg font-medium text-gray-700"
                        >
                          ปี
                        </label>
                        <input
                          type="text"
                          id="birthyear"
                          name="birthyear"
                          value={forms[currentIndex]?.birthyear || ""}
                          onChange={handleInputChange}
                          className="input text-lg"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="birthtime"
                          className="block text-lg font-medium text-gray-700"
                        >
                          เวลาเกิด
                        </label>
                        <input
                          type="text"
                          id="birthtime"
                          name="birthtime"
                          value={forms[currentIndex]?.birthtime || ""}
                          onChange={handleInputChange}
                          className="input text-lg"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="birthconstellation"
                          className="block text-lg font-medium text-gray-700"
                        >
                          ปีนักษัตร
                        </label>
                        <select
                          id="birthconstellation"
                          name="birthconstellation"
                          value={forms[currentIndex]?.birthconstellation || ""}
                          onChange={handleInputChange}
                          className="select"
                          required
                        >
                          <option value={""} disabled={true}>
                            เลือกปีนักษัตร
                          </option>
                          <option value={"ไม่ทราบปีนักษัตร"}>
                            ไม่ทราบปีนักษัตร
                          </option>
                          <option value={"ชวด"}>ชวด</option>
                          <option value={"ฉลู"}>ฉลู</option>
                          <option value={"ขาล"}>ขาล</option>
                          <option value={"เถาะ"}>เถาะ</option>
                          <option value={"มะโรง"}>มะโรง</option>
                          <option value={"มะเส็ง"}>มะเส็ง</option>
                          <option value={"มะเมีย"}>มะเมีย</option>
                          <option value={"มะแม"}>มะแม</option>
                          <option value={"วอก"}>วอก</option>
                          <option value={"ระกา"}>ระกา</option>
                          <option value={"จอ"}>จอ</option>
                          <option value={"กุน"}>กุน</option>
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="age"
                          className="block text-lg font-medium text-gray-700"
                        >
                          อายุ
                        </label>
                        <input
                          type="text"
                          id="age"
                          name="age"
                          value={forms[currentIndex]?.age || ""}
                          onChange={handleInputChange}
                          className="input text-lg"
                          required
                        />
                      </div>
                    </div>
                  )}
                  {campaign?.formDetails === "many_Names" && (
                    <div>
                      <label
                        htmlFor="many_names"
                        className="block text-lg font-medium text-gray-700"
                      >
                        รายนามเจ้าภาพ
                      </label>
                      <textarea
                        id="many_names"
                        name="many_names"
                        rows={5}
                        value={forms[currentIndex]?.many_names || ""}
                        onChange={handleInputChange}
                        className="textarea text-lg"
                        required
                      />
                    </div>
                  )}
                  {campaign?.formWish === true && (
                    <div>
                      <label
                        htmlFor="wish"
                        className="block text-lg font-medium text-gray-700"
                      >
                        คำขอพร
                      </label>
                      <textarea
                        id="wish"
                        name="wish"
                        rows={5}
                        value={forms[currentIndex]?.wish || ""}
                        onChange={handleInputChange}
                        className="textarea text-lg"
                      />
                    </div>
                  )}
                </div>
              </form>
            )}
          </div>
          <div className="h-1/6 flex justify-between items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="py-2 px-4 bg-gray-200 rounded-2xl w-40"
            >
              ย้อนกลับ
            </button>

            <button
              form={`form[${currentIndex}]`}
              type="submit"
              className="py-2 px-4 bg-red-950 text-white rounded-2xl w-40"
            >
              ถัดไป
            </button>
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="card w-full h-[70vh] flex items-center bg-white/90 rounded-lg">
          <div className="h-5/6 w-full p-4 flex flex-col items-center overflow-hidden overflow-y-auto">
            <div>
              <Image
                className="rounded-lg"
                src="/QRCODE.jpg"
                height={200}
                width={200}
                alt="QRCODE"
              />
            </div>
            <div className="flex flex-row justify-center mt-4">
              <p className="text-xl text-end mr-2">ยอดรวมสุทธิ</p>
              <p className="px-2 text-xl text-center bg-red-200 rounded-xl">
                {campaign?.price !== null &&
                  parseInt(String(campaign?.price)) * formCount}
              </p>
              <p className="text-xl text-start ml-2">บาท</p>
            </div>
            <Image
              className="mt-2 w-full"
              src="/Asset279.png"
              width={500}
              height={500}
              alt="QRCODE"
            />
            <div className="w-full flex flex-col gap-2">
              <h2 className="text-xl font-bold text-[#BD9B5B] text-center">
                แนบสลิปหลักฐานการชำระเงิน
              </h2>
              <p className="text-xs text-center">
                * กรุณาอัปโหลดภาพสลิปที่เห็นชื่อและ QR Code ชัดเจน
              </p>
              <div className="mt-2 px-4 flex  justify-center flex-row">
                <input
                  type="file"
                  accept="image/*"
                  className="file-input w-full"
                  onChange={(e) =>
                    setImage(e.target.files ? e.target.files[0] : null)
                  }
                />
              </div>
            </div>
          </div>
          <div className="h-1/6 flex justify-between items-center gap-2">
            {step > 1 && (
              <button
                className="py-2 px-4 bg-gray-200 rounded-2xl w-40"
                onClick={prevStep}
              >
                ย้อนกลับ
              </button>
            )}
            <button
              className="py-2 px-4 bg-red-950 text-white rounded-2xl w-40"
              onClick={payNoti}
            >
              ถัดไป
            </button>
          </div>
        </div>
      )}
      {step === 4 && (
        <div className="card w-full h-[70vh] flex items-center bg-white/90 rounded-lg">
          <div className="h-full w-full p-4">
            <h1 className="text-2xl font-bold text-center">
              ดำเนินการเสร็จสิ้น
            </h1>
            <div>
              <Image
                className="mt-2 w-full"
                src="/Asset279.png"
                width={500}
                height={500}
                alt="QRCODE"
              />
            </div>
            <div className="flex flex-col justify-center items-center">
              <h1 className="mt-5 text-xl font-bold text-center">
                ขออนุโมทนากับ
              </h1>
              <h1 className="w-full text-xl text-center truncate">
                คุณ {profile?.displayName}
              </h1>
              <h1 className="mt-2 text-lg text-center">ที่ได้ร่วมกองบุญ</h1>
              <h1 className="w-full text-lg text-center truncate">
                #{campaign?.name}
              </h1>
              <div>
                <Image
                  className="rounded-lg"
                  src="/logo.png"
                  height={200}
                  width={200}
                  alt="QRCODE"
                />
              </div>
              <div>
                <Image
                  className="mt-2 w-full"
                  src="/Asset279.png"
                  width={500}
                  height={500}
                  alt="QRCODE"
                />
              </div>
              <button
                className="py-2 px-4 mt-5 bg-red-950 text-white rounded-2xl w-full"
                onClick={() => {
                  window.location.href = "/";
                }}
              >
                กลับสู่หน้าหลัก
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="modal">
        <dialog id="modalNext" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-2xl text-center text-[#B3885B]">
              ตรวจสอบข้อมูลให้ถูกต้อง
            </h3>
            <h3 className="font-bold text-2xl text-center text-[#B3885B]">
              ก่อนทำการยืนยัน
            </h3>
            <div className="border-b-2 border-base-300 mt-2"></div>
            <div className="flex flex-col justify-center items-center px-4 py-10">
              {campaign?.formDetails === "fullName" && (
                <div className="flex flex-col gap-2 w-full">
                  <h1 className="text-lg font-bold text-left">
                    ชื่อ-นามสกุล: {forms[currentIndex]?.name}
                  </h1>
                </div>
              )}
              {campaign?.formDetails === "fullName_BirthDay" && (
                <div className="flex flex-col gap-2 w-full">
                  <h1 className="text-lg font-bold text-left">
                    ชื่อ-นามสกุล: {forms[currentIndex]?.name}
                  </h1>
                  <h1 className="text-lg font-bold text-left">
                    วันเดือนปีเกิด: {forms[currentIndex]?.birthdate}{" "}
                    {forms[currentIndex]?.birthmonth}{" "}
                    {forms[currentIndex]?.birthyear}
                  </h1>
                  <h1 className="text-lg font-bold text-left">
                    เวลาเกิด: {forms[currentIndex]?.birthtime}
                  </h1>
                  <h1 className="text-lg font-bold text-left">
                    ปีนักษัตร: {forms[currentIndex]?.birthconstellation}
                  </h1>
                  <h1 className="text-lg font-bold text-left">
                    อายุ: {forms[currentIndex]?.age}
                  </h1>
                </div>
              )}
              {campaign?.formDetails === "many_Names" && (
                <div className="flex flex-col gap-2 w-full">
                  <h1 className="text-lg font-bold text-left">
                    รายนามเจ้าภาพ:{" "}
                    {forms[currentIndex]?.many_names
                      .split("\n")
                      .map((name, index) => (
                        <div key={index} className="flex flex-col gap-1">
                          <span>{name}</span>
                        </div>
                      ))}
                  </h1>
                </div>
              )}
            </div>
            <div className="modal-action flex gap-2">
              <form method="dialog">
                <button className="py-2 px-4 bg-gray-200 rounded-2xl w-40">
                  ออก
                </button>
              </form>
              <button
                className="py-2 px-4 bg-red-950 text-white rounded-2xl w-40"
                onClick={modalNext}
                form="formUserUpdate"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </dialog>

        <dialog id="modalOldDonation" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-2xl text-center text-[#B3885B]">
              เลือกจากประวัติการร่วมบุญ
            </h3>
            <div className="border-b-2 border-base-300 mt-2"></div>

            {Array.isArray(oldDonation) && oldDonation.length === 0 && (
              <h1 className="text-xl text-center mt-10">
                ไม่พบข้อมูลประวัติการร่วมบุญ
              </h1>
            )}
            <div className="grid grid-cols-2 gap-2 w-full h-full justify-center items-center px-2 py-10 overflow-hidden overflow-y-auto">
              {Array.isArray(oldDonation) &&
                oldDonation.map((old: FormEntry) => (
                  <button
                    key={old.id}
                    onClick={() => handleSeleted(old)}
                    className="btn btn-outline flex flex-col justify-center items-center border-1 w-full h-20"
                  >
                    <h1 className="text-lg text-left w-full truncate">
                      {old.name}
                    </h1>
                  </button>
                ))}
            </div>

            <div className="modal-action flex gap-2">
              <form method="dialog">
                <button className="py-2 px-4 bg-gray-200 rounded-2xl w-40">
                  ออก
                </button>
              </form>
            </div>
          </div>
        </dialog>
      </div>
    </div>
  );
}
