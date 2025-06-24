"use client";

import { useCallback, useEffect, useState } from "react";
import { ProfileInterface } from "../../interface/ProfileInterface";
import { getCookie } from "cookies-next";
import { getAuthHeaders } from "../../component/Headers";
import axios from "axios";
import { campaign_transactionsInterface } from "../../interface/campaign_transactionsInterface";
import { useParams } from "next/navigation";
import Image from "next/image";

export default function StatusPage() {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileInterface | null>(null);
  const [images, setImages] = useState<string[] | null>();
  const [campaignName, setCampaignName] = useState("");

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
        process.env.NEXT_PUBLIC_API_URL + `/donation/statusimages/${id}`;
      const headers = getAuthHeaders();
      const res = await axios.get(url, { headers });

      if (res.data) {
        setImages(res.data.images);
        setCampaignName(res.data.campaignName);
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
    <div className="h-full w-full overflow-hidden my-16 p-2 flex flex-col gap-2">
      <div className="crad w-full rounded-lg text-center text-xl p-4 bg-white/50">
        <p className="text-lg">ยินดีต้อนรับคุณ</p>
        <p className="w-full truncate">{profile?.displayName}</p>
      </div>
      <div className="w-full h-[70vh] overflow-hidden overflow-y-auto bg-white rounded-lg">
        <h1 className="text-2xl text-center font-bold my-2">รูปภาพกองบุญ</h1>
        <h1 className="text-xl text-center my-2">{campaignName}</h1>
        <div className="flex flex-col gap-2 p-2 card">
          {Array.isArray(images) &&
            images.map((image: string) => (
              <div key={image} className="">
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/img/pushimages/${image}`}
                  width={400}
                  height={400}
                  alt={image}
                />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
