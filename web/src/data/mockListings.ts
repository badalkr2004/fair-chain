export interface Listing {
  id: string;
  crop: string;
  quantity: number;
  unit: string;
  price: number;
  status: "Available" | "In Transit" | "Sold";
  location: string;
  date: string;
  interestedBuyers: number;
}

export const mockListings: Listing[] = [
  {
    id: "1",
    crop: "Wheat",
    quantity: 1000,
    unit: "kg",
    price: 25,
    status: "Available",
    location: "Punjab",
    date: "2024-03-15",
    interestedBuyers: 3,
  },
  {
    id: "2",
    crop: "Rice",
    quantity: 500,
    unit: "kg",
    price: 30,
    status: "In Transit",
    location: "Haryana",
    date: "2024-03-10",
    interestedBuyers: 2,
  },
  {
    id: "3",
    crop: "Maize",
    quantity: 800,
    unit: "kg",
    price: 20,
    status: "Sold",
    location: "Uttar Pradesh",
    date: "2024-03-05",
    interestedBuyers: 1,
  },
  {
    id: "4",
    crop: "Soybean",
    quantity: 600,
    unit: "kg",
    price: 35,
    status: "Available",
    location: "Madhya Pradesh",
    date: "2024-03-12",
    interestedBuyers: 4,
  },
  {
    id: "5",
    crop: "Cotton",
    quantity: 300,
    unit: "kg",
    price: 40,
    status: "Available",
    location: "Gujarat",
    date: "2024-03-08",
    interestedBuyers: 2,
  },
]; 