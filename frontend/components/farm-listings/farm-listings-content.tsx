"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FarmCard } from "./farm-card";
import { FarmFilters } from "./farm-filters";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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

export function FarmListingsContent() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCrop, setSelectedCrop] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [roiRange, setRoiRange] = useState<[number, number]>([0, 25]);

  // 🧠 Fetch farm data from API or blockchain
  useEffect(() => {
    const fetchFarms = async () => {
      try {
        setLoading(true);
        setError(null);

        // Example: from your API or wagmi publicClient call
        const res = await fetch("/api/farms"); // or call your contract via wagmi/viem
        if (!res.ok) throw new Error("Failed to fetch farms");

        const data = await res.json();
        setFarms(data.farms || []);
      } catch (err: any) {
        console.error("Error fetching farms:", err);
        toast.error("Failed to load farm listings");
        setError(err.message || "Failed to load farms");
      } finally {
        setLoading(false);
      }
    };

    fetchFarms();
  }, []);

  // 🧮 Filtering logic
  const filteredFarms = farms.filter((farm) => {
    const matchesSearch =
      farm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farm.cropType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farm.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCrop =
      selectedCrop === "all" ||
      farm.cropType.toLowerCase() === selectedCrop.toLowerCase();

    const matchesRegion =
      selectedRegion === "all" ||
      farm.location.toLowerCase().includes(selectedRegion.toLowerCase());

    const matchesRoi = farm.roi >= roiRange[0] && farm.roi <= roiRange[1];

    return matchesSearch && matchesCrop && matchesRegion && matchesRoi;
  });

  // 🧾 Render
  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">
            Explore Farm <span className="text-primary">Opportunities</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Invest in verified farms and earn returns from agricultural yields
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search farms by name, crop type, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Filters */}
        <FarmFilters
          selectedCrop={selectedCrop}
          setSelectedCrop={setSelectedCrop}
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          roiRange={roiRange}
          setRoiRange={setRoiRange}
        />

        {/* Results */}
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">
            Loading farms...
          </div>
        ) : error ? (
          <div className="text-center py-20 text-destructive">⚠️ {error}</div>
        ) : filteredFarms.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {filteredFarms.length}
                </span>{" "}
                farm
                {filteredFarms.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFarms.map((farm, index) => (
                <FarmCard key={farm.id || index} farm={farm} index={index} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No farms found matching your criteria
          </div>
        )}
      </motion.div>
    </div>
  );
}
