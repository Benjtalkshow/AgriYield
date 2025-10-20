import { AGRIYIELD_CONTRACT_ABI } from "@/const/abi";
import { useReadContract, useReadContracts } from "wagmi";
import { useState, useEffect } from "react";

const contractAddress = process.env
  .NEXT_PUBLIC_AGRIYIELD_CONTRACT_ADDRESS as `0x${string}`;

// Get total farm count
export const useGetFarmCounter = () => {
  return useReadContract({
    address: contractAddress,
    abi: AGRIYIELD_CONTRACT_ABI,
    functionName: "farmCounter",
  });
};

// Get all farms by fetching farmCounter first, then each farm
export const useGetAllFarms = () => {
  const { data: farmCounter, isLoading: isLoadingCounter } =
    useGetFarmCounter();
  const [farmIds, setFarmIds] = useState<number[]>([]);

  // Generate array of farm IDs once we have the counter
  useEffect(() => {
    if (farmCounter) {
      const count = Number(farmCounter);
      const ids = Array.from({ length: count }, (_, i) => i + 1);
      setFarmIds(ids);
    }
  }, [farmCounter]);

  // Fetch all farms using multicall
  const {
    data: farms,
    isLoading: isLoadingFarms,
    refetch,
  } = useReadContracts({
    contracts: farmIds.map((id) => ({
      address: contractAddress,
      abi: AGRIYIELD_CONTRACT_ABI,
      functionName: "getFarm" as const,
      args: [BigInt(id)],
    })),
    query: {
      enabled: farmIds.length > 0,
    },
  });

  // Format the results
  const formattedFarms = farms
    ?.map((result, index) => ({
      farmId: farmIds[index],
      data: result.result,
      status: result.status,
    }))
    .filter((farm) => farm.status === "success");

  return {
    farms: formattedFarms || [],
    isLoading: isLoadingCounter || isLoadingFarms,
    farmCounter: farmCounter ? Number(farmCounter) : 0,
    refetch,
  };
};

// Get farms with specific status
export const useGetFarmsByStatus = (status: number) => {
  const { farms, isLoading } = useGetAllFarms();

  const filteredFarms = farms
    ?.filter((farm: any) => farm.data?.status === status)
    .map((farm: any) => farm.data);

  return {
    farms: filteredFarms || [],
    isLoading,
  };
};

// Get active farms only
export const useGetActiveFarms = () => {
  return useGetFarmsByStatus(0); // Status.Active = 0
};

// Get verified farms
export const useGetVerifiedFarms = () => {
  const { farms, isLoading } = useGetAllFarms();

  const verifiedFarms = farms
    ?.filter((farm: any) => farm.data?.verified === true)
    .map((farm: any) => farm.data);

  return {
    farms: verifiedFarms || [],
    isLoading,
  };
};

// Get paginated farms
export const useGetPaginatedFarms = (
  page: number = 1,
  perPage: number = 10
) => {
  const { farms, isLoading, farmCounter } = useGetAllFarms();

  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedFarms = farms?.slice(startIndex, endIndex);

  const totalPages = Math.ceil((farms?.length || 0) / perPage);

  return {
    farms: paginatedFarms || [],
    isLoading,
    totalFarms: farmCounter,
    currentPage: page,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};
