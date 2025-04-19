import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListingCard } from "@/components/produce/ListingCard";
import { mockListings, Listing } from "@/data/mockListings";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddListingDialog } from "@/components/produce";
// import { useState } from "react";

export default function ProduceListings() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Link href="/farmer/dashboard">
          <Button variant="ghost" className="mb-4">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Produce Listings</h1>
          <p className="mt-2 text-gray-600">
            Manage your crop listings and track interested buyers
          </p>
        </div>
        <AddListingDialog />
      </div>

      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Listings</TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="in-transit">In Transit</TabsTrigger>
          <TabsTrigger value="sold">Sold</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockListings.map((listing: Listing) => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="available" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockListings
              .filter((l: Listing) => l.status === "Available")
              .map((listing: Listing) => (
                <ListingCard key={listing.id} {...listing} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="in-transit" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockListings
              .filter((l: Listing) => l.status === "In Transit")
              .map((listing: Listing) => (
                <ListingCard key={listing.id} {...listing} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="sold" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockListings
              .filter((l: Listing) => l.status === "Sold")
              .map((listing: Listing) => (
                <ListingCard key={listing.id} {...listing} />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
