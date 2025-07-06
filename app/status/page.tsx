"use client";

import { useCallback, useEffect, useState } from "react";
import { ProfileInterface } from "../interface/ProfileInterface";
import { getCookie } from "cookies-next";
import { getAuthHeaders } from "../component/Headers";
import axios from "axios";
import { campaign_transactionsInterface } from "../interface/campaign_transactionsInterface";
import Link from "next/link";

export default function StatusPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileInterface | null>(null);
  const [olds, setOlds] = useState<campaign_transactionsInterface[] | null>();
  const redirectToLineLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_LINE_CHANNEL_ID;
    const redirectUri = encodeURIComponent(
      process.env.NEXT_PUBLIC_LINE_LOGIN_REDIRECT_URI || ""
    );
    const state = Math.random().toString(36).substring(7);

    const url = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=openid%20profile%20email`;

    window.location.href = url;
  };

  useEffect(() => {
    const userProfile = getCookie("profile");

    if (!userProfile) {
      redirectToLineLogin();
      return;
    }

    setProfile(JSON.parse(userProfile?.toString()));
    setIsLoading(false);
  }, []);

  const fetchDonation = useCallback(async () => {
    try {
      const url =
        process.env.NEXT_PUBLIC_API_URL + `/donation/old/${profile?.userId}`;
      const headers = getAuthHeaders();
      const old = await axios.get(url, { headers });

      if (old.data) {
        setOlds(old.data.campaign_transactions);
      }
    } catch (error: unknown) {
      const e = error as Error;
      console.log(e);
    }
  }, [profile]);

  useEffect(() => {
    fetchDonation();
  }, [profile, fetchDonation]);

  if (isLoading == true) {
    return (
      <div className="flex w-full h-screen justify-center items-center">
        <span className="loading loading-spinner loading-xl text-white"></span>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden my-18 p-2 flex flex-col gap-2">
      <div className="crad w-full rounded-lg text-center text-xl p-4 bg-white/50">
        <p className="text-lg">ยินดีต้อนรับคุณ</p>
        <p className="w-full truncate">{profile?.displayName}</p>
      </div>
      <div className="w-full h-[70vh] overflow-hidden overflow-y-auto bg-white rounded-lg">
        <h1 className="text-2xl text-center font-bold">สถานะกองบุญ</h1>
        <h1 className="text-md text-center">*สถานะส่งภาพแล้ว</h1>
        <h1 className="text-md text-center  my-2">
          (สามารถกดที่แถบสถานะเพื่อดูภาพที่ได้)
        </h1>
        <div className="flex flex-col gap-2 p-2">
          {Array.isArray(olds) &&
            olds.map((old: campaign_transactionsInterface) => (
              <div
                key={old.id}
                className="w-full h-16 rounded-xl text-white bg-red-950 flex justify-between items-center p-2"
              >
                <div className="w-3/5">
                  <h1 className="truncate">{old.campaign.name}</h1>
                  <h1 className="truncate">
                    {old.name}
                    {old.many_names}
                  </h1>
                </div>
                <div className="w-auto">
                  {old.status === "PENDING" && (
                    <h1 className="px-2 text-md text-center bg-warning rounded-xl">
                      รอดำเนินการ
                    </h1>
                  )}
                  {old.status === "COMPLETE" && (
                    <h1 className="px-2 text-md text-center bg-success rounded-xl">
                      ดำเนินการแล้ว
                    </h1>
                  )}
                  {old.status === "SENDIMG" && (
                    <Link href={`/status/${old.id}`}>
                      <h1 className="px-2 text-md text-center bg-success rounded-xl">
                        ส่งภาพแล้ว
                      </h1>
                    </Link>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
