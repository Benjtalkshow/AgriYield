"use client";

import React from "react";
import { useSimpleFarms } from "@/hooks/useSimpleFarms";

export interface Farm {
  id: string;
  name: string;
  farmer: string;
  cropType: string;
  image: string;
  duration: string;
  roi: number;
  location: string;
  city: string;
  state: string;
  fundingGoal: number;
  amountRaised: number;
  fundingProgress: number;
  minInvestment: number;
  description: string;
  coordinates: [number, number];
  verified: boolean;
  investors: number;
}

export const nigeriaCities = [
  { city: "Lagos", state: "Lagos" },
  { city: "Ikeja", state: "Lagos" },
  { city: "Abeokuta", state: "Ogun" },
  { city: "Kano", state: "Kano" },
  { city: "Port Harcourt", state: "Rivers" },
  { city: "Enugu", state: "Enugu" },
  { city: "Ibadan", state: "Oyo" },
  { city: "Benin City", state: "Edo" },
  { city: "Kaduna", state: "Kaduna" },
  { city: "Abuja", state: "FCT" },
  { city: "Jos", state: "Plateau" },
  { city: "Calabar", state: "Cross River" },
  { city: "Owerri", state: "Imo" },
  { city: "Uyo", state: "Akwa Ibom" },
  { city: "Warri", state: "Delta" },
];

// ✅ A component that simply uses the hook and returns the farms data
export default function SimpleFarmsProvider() {
  const { farms } = useSimpleFarms();

  // Instead of returning JSX, we just return the raw data
  return { farms };
}
