export interface PriceData {
  date: string;
  potatoes: number;
  apples: number;
  bananas: number;
  wheat: number;
  rice: number;
}

export interface MandiPrice {
  mandi: string;
  price: number;
  distance: number;
  last_updated: string;
}

export interface ForecastData {
  crop: string;
  current_price: number;
  price_trend: string;
  price_forecast: {
    date: string;
    price: number;
  }[];
  last_updated: string;
} 