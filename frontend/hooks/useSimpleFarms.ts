// hooks/useSimpleFarms.ts
import { AGRIYIELD_CONTRACT_ABI } from "@/const/abi";
import { useReadContract } from "wagmi";
import { useState, useEffect } from "react";

const contractAddress = process.env
  .NEXT_PUBLIC_AGRIYIELD_CONTRACT_ADDRESS as `0x${string}`;

export const useSimpleFarms = () => {
  const [farms, setFarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<any[]>([]);

  // Debug contract address
  useEffect(() => {
    console.log("🔍 Contract Address:", contractAddress);
    console.log("🔍 Address is valid:", contractAddress && contractAddress.startsWith('0x'));
  }, []);

  // Fetch farms 1, 2, 3 directly
  const farm1 = useReadContract({
    address: contractAddress,
    abi: AGRIYIELD_CONTRACT_ABI,
    functionName: "getFarm",
    args: [BigInt(1)],
  });

  const farm2 = useReadContract({
    address: contractAddress,
    abi: AGRIYIELD_CONTRACT_ABI,
    functionName: "getFarm",
    args: [BigInt(2)],
  });

  const farm3 = useReadContract({
    address: contractAddress,
    abi: AGRIYIELD_CONTRACT_ABI,
    functionName: "getFarm",
    args: [BigInt(3)],
  });

  // Combine results when all are loaded or errored
  useEffect(() => {
    const allFarms = [farm1, farm2, farm3];
    
    console.log("🚀 Farm fetch status:", {
      farm1: { isLoading: farm1.isLoading, data: !!farm1.data, error: !!farm1.error, status: farm1.status },
      farm2: { isLoading: farm2.isLoading, data: !!farm2.data, error: !!farm2.error, status: farm2.status },
      farm3: { isLoading: farm3.isLoading, data: !!farm3.data, error: !!farm3.error, status: farm3.status }
    });

    // Check if any are still loading
    const isLoading = allFarms.some((farm) => farm.isLoading);
    
    // Check if all have finished (either success or error)
    const allFinished = allFarms.every((farm) => farm.status === 'success' || farm.status === 'error');

    if (allFinished || !isLoading) {
      console.log("📊 Processing farm data:");
      
      const processedFarms = allFarms.map((farm, index) => {
        const farmData = {
          farmId: index + 1,
          data: farm.data,
          error: farm.error,
          status: farm.status,
        };
        
        console.log(`Farm ${index + 1}:`, {
          hasData: !!farmData.data,
          error: farmData.error?.message || farmData.error,
          status: farmData.status
        });
        
        return farmData;
      });

      // Include farms with valid data (non-zero farmId means farm exists)
      const validFarms = processedFarms.filter(farm => {
        if (farm.error) {
          console.warn(`❌ Farm ${farm.farmId} has error:`, farm.error);
          return false;
        }
        
        if (!farm.data) {
          console.warn(`⚠️ Farm ${farm.farmId} has no data`);
          return false;
        }
        
        // Check if farm actually exists (farmId should not be 0)
        const farmExists = farm.data && farm.data.farmId && Number(farm.data.farmId) > 0;
        console.log(`Farm ${farm.farmId} exists:`, farmExists, farm.data?.farmId);
        
        return farmExists;
      });

      console.log("✅ Valid farms found:", validFarms.length, validFarms.map(f => f.farmId));
      
      setFarms(validFarms);
      setErrors(processedFarms.filter(f => f.error).map(f => f.error));
      setLoading(false);
    }
  }, [
    farm1.isLoading,
    farm2.isLoading, 
    farm3.isLoading,
    farm1.data,
    farm2.data,
    farm3.data,
    farm1.error,
    farm2.error,
    farm3.error,
    farm1.status,
    farm2.status,
    farm3.status,
  ]);

  return {
    farms,
    loading,
    errors,
    contractAddress,
    refetch: () => {
      console.log("🔄 Refetching all farms...");
      farm1.refetch();
      farm2.refetch();
      farm3.refetch();
    },
  };
};