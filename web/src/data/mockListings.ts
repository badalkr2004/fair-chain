export interface Listing {
  id: number;
  name: string;
  quantity: string;
  price: number;
  harvestDate: string;
  status: "Available" | "In Transit" | "Sold";
  image: string;
  interestedBuyers: number;
}

export const mockListings: Listing[] = [
  {
    id: 1,
    name: "Organic Tomatoes",
    quantity: "500 kg",
    price: 40,
    harvestDate: "2024-04-15",
    status: "Available",
    image: "https://source.unsplash.com/300x300/?tomatoes",
    interestedBuyers: 3,
  },
  {
    id: 2,
    name: "Premium Rice",
    quantity: "1000 kg",
    price: 60,
    harvestDate: "2024-04-10",
    status: "In Transit",
    image: "https://source.unsplash.com/300x300/?rice",
    interestedBuyers: 5,
  },
  {
    id: 3,
    name: "Fresh Potatoes",
    quantity: "300 kg",
    price: 25,
    harvestDate: "2024-04-05",
    status: "Sold",
    image: "https://source.unsplash.com/300x300/?potatoes",
    interestedBuyers: 2,
  },
]; 