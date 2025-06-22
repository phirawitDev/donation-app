"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import { getAuthHeaders } from "./component/Headers";
import { campaignsInterface } from "./interface/campaignsInterface";
import { getCookie } from "cookies-next";
import { ProfileInterface } from "./interface/ProfileInterface";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<campaignsInterface | null>();
  const [profile, setProfile] = useState<ProfileInterface | null>(null);
  const totalSlide = Array.isArray(campaigns) ? campaigns.length : 0;

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
  }, []);

  const fetchCampaigns = async () => {
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "/donation/list";
      const headers = getAuthHeaders();
      const res = await axios.get(url, { headers });
      if (res.status === 200) {
        setIsLoading(false);
        setCampaigns(res.data);
      }
    } catch (error: unknown) {
      setIsLoading(false);
      const e = error as Error;
      console.log(e.message);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  if (isLoading == true) {
    return (
      <div className="flex w-full h-screen justify-center items-center">
        <span className="loading loading-spinner loading-xl text-white"></span>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden my-16 p-2 flex flex-col gap-2">
      <div className="crad w-full rounded-lg text-center text-xl p-4 bg-white/50">
        <p className="text-lg">ยินดีต้อนรับคุณ</p>
        <p className="w-full truncate">{profile?.displayName}</p>
      </div>
      <div className="w-full h-[70vh] bg-white rounded-lg">
        <h1 className="text-2xl text-center font-bold my-2">
          กองบุญที่เปิดให้ร่วมบุญ
        </h1>
        {!campaigns && (
          <div className="h-[80%] w-full flex flex-col gap-2 justify-center items-center">
            <span className="loading loading-infinity loading-xl"></span>
            <p className="text-center text-xl">
              ยังไม่มีกองบุญที่เปิดให้ร่วมบุญ
            </p>
          </div>
        )}
        <div className="carousel w-full h-[90%]">
          {Array.isArray(campaigns) &&
            campaigns?.map((campaign: campaignsInterface, index) => (
              <div
                key={campaign.id}
                id={`slide${index + 1}`}
                className="carousel-item relative w-full"
              >
                <Link
                  href={
                    campaign.price === 1
                      ? "/campaign/all/" + campaign.id
                      : "/campaign/" + campaign.id
                  }
                  onClick={() => setIsLoading(!isLoading)}
                >
                  <Image
                    src={`${
                      process.env.NEXT_PUBLIC_API_URL + campaign.campaign_img
                    }`}
                    alt="campaigns"
                    fill
                  />
                </Link>
                <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
                  <a
                    href={`#slide${
                      index + 1 === 1 ? totalSlide : index + 1 - 1
                    }`}
                    className="btn btn-circle text-xl"
                  >
                    ❮
                  </a>
                  <a
                    href={`#slide${index + 1 === totalSlide ? 1 : index + 2}`}
                    className="btn btn-circle text-xl"
                  >
                    ❯
                  </a>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
