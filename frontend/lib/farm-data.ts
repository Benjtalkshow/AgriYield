export interface Farm {
  id: string
  name: string
  farmer: string
  cropType: string
  image: string
  duration: string
  roi: number
  location: string
  city: string
  state: string
  fundingGoal: number
  amountRaised: number
  fundingProgress: number
  minInvestment: number
  description: string
  coordinates: [number, number]
  verified: boolean
  investors: number
}

export const farms: Farm[] = [
  {
    id: "1",
    name: "Ikeja Vegetable Farm",
    farmer: "Adebayo Okonkwo",
    cropType: "Vegetables",
    image: "/golden-wheat-farm.png",
    duration: "6 months",
    roi: 18,
    location: "Ikeja, Lagos",
    city: "Ikeja",
    state: "Lagos",
    fundingGoal: 5000000,
    amountRaised: 3200000,
    fundingProgress: 64,
    minInvestment: 50000,
    description:
      "Premium vegetable cultivation in Lagos using modern greenhouse technology. High demand from local markets and restaurants.",
    coordinates: [6.5964, 3.3486],
    verified: true,
    investors: 24,
  },
  {
    id: "2",
    name: "Abeokuta Cassava Plot",
    farmer: "Ngozi Eze",
    cropType: "Cassava",
    image: "/rice-farm.jpg",
    duration: "5 months",
    roi: 14,
    location: "Abeokuta, Ogun",
    city: "Abeokuta",
    state: "Ogun",
    fundingGoal: 3000000,
    amountRaised: 1500000,
    fundingProgress: 50,
    minInvestment: 20000,
    description:
      "Large-scale cassava farming with processing facilities. Strong demand from garri and flour producers across Nigeria.",
    coordinates: [7.1475, 3.3619],
    verified: true,
    investors: 18,
  },
  {
    id: "3",
    name: "Kano Tomato Farm",
    farmer: "Ibrahim Musa",
    cropType: "Tomatoes",
    image: "/modern-greenhouse-with-tomato-plants.jpg",
    duration: "4 months",
    roi: 20,
    location: "Kano, Kano",
    city: "Kano",
    state: "Kano",
    fundingGoal: 4000000,
    amountRaised: 3800000,
    fundingProgress: 95,
    minInvestment: 30000,
    description:
      "Climate-controlled tomato production in Northern Nigeria. Established supply contracts with major food processors.",
    coordinates: [12.0022, 8.5919],
    verified: true,
    investors: 32,
  },
  {
    id: "4",
    name: "Port Harcourt Rice Paddy",
    farmer: "Chioma Nwosu",
    cropType: "Rice",
    image: "/corn-farm.png",
    duration: "8 months",
    roi: 16,
    location: "Port Harcourt, Rivers",
    city: "Port Harcourt",
    state: "Rivers",
    fundingGoal: 6000000,
    amountRaised: 2400000,
    fundingProgress: 40,
    minInvestment: 75000,
    description:
      "Premium rice cultivation using sustainable irrigation methods. Targeting local and export markets with quality produce.",
    coordinates: [4.8156, 7.0498],
    verified: true,
    investors: 15,
  },
  {
    id: "5",
    name: "Enugu Soybean Fields",
    farmer: "Emeka Okafor",
    cropType: "Soybeans",
    image: "/soybean-field-with-green-plants.jpg",
    duration: "7 months",
    roi: 15,
    location: "Enugu, Enugu",
    city: "Enugu",
    state: "Enugu",
    fundingGoal: 5500000,
    amountRaised: 4125000,
    fundingProgress: 75,
    minInvestment: 40000,
    description:
      "Large-scale soybean operation with modern equipment. Strong demand from oil mills and animal feed producers.",
    coordinates: [6.4403, 7.4966],
    verified: true,
    investors: 28,
  },
  {
    id: "6",
    name: "Ibadan Maize Plantation",
    farmer: "Folake Adeyemi",
    cropType: "Maize",
    image: "/apple-orchard-with-red-apples.jpg",
    duration: "5 months",
    roi: 17,
    location: "Ibadan, Oyo",
    city: "Ibadan",
    state: "Oyo",
    fundingGoal: 4500000,
    amountRaised: 1800000,
    fundingProgress: 40,
    minInvestment: 35000,
    description:
      "High-yield maize varieties with established buyer contracts. Quick turnaround and reliable returns for investors.",
    coordinates: [7.3775, 3.947],
    verified: true,
    investors: 12,
  },
  {
    id: "7",
    name: "Benin City Plantain Farm",
    farmer: "Osaze Igbinovia",
    cropType: "Plantain",
    image: "/golden-wheat-farm.png",
    duration: "9 months",
    roi: 19,
    location: "Benin City, Edo",
    city: "Benin City",
    state: "Edo",
    fundingGoal: 3500000,
    amountRaised: 2800000,
    fundingProgress: 80,
    minInvestment: 25000,
    description:
      "Premium plantain cultivation with organic farming practices. Strong market demand across Southern Nigeria.",
    coordinates: [6.335, 5.6037],
    verified: true,
    investors: 22,
  },
  {
    id: "8",
    name: "Kaduna Pepper Farm",
    farmer: "Fatima Abdullahi",
    cropType: "Pepper",
    image: "/rice-farm.jpg",
    duration: "6 months",
    roi: 22,
    location: "Kaduna, Kaduna",
    city: "Kaduna",
    state: "Kaduna",
    fundingGoal: 2500000,
    amountRaised: 1750000,
    fundingProgress: 70,
    minInvestment: 15000,
    description:
      "Spicy pepper varieties including scotch bonnet and habanero. High-value crop with strong export potential.",
    coordinates: [10.5105, 7.4165],
    verified: true,
    investors: 19,
  },
]

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
]
