import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import Autoplay from "embla-carousel-autoplay"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const StaffHome = () => {
  const plugin = useRef(
  Autoplay({ delay: 4000, stopOnInteraction: false })
);

  return (
    <div className="text-black bg-[#e8f8f6] min-h-screen px-4 py-6">
      {/* Hero Section */}
      <section className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">
          Enjoy Your <span className="text-green-600">Delicious Food</span>
        </h1>
        <p className="text-gray-600 mb-4">
          Order from your table and relax while we prepare your meal
        </p>
        <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2">
          Order now
        </Button>

        {/* Slider Section */}
   

<Carousel
  plugins={[plugin.current]}
  className="rounded-xl overflow-hidden"
  onMouseEnter={plugin.current.stop}
  onMouseLeave={plugin.current.reset}
>
  <CarouselContent>
    {[
      "https://images.unsplash.com/photo-1600891964599-f61ba0e24092",
      "https://images.unsplash.com/photo-1604908176965-d1f418b443f8",
      "https://images.unsplash.com/photo-1613141411663-b7c19be33622",
    ].map((url, index) => (
      <CarouselItem key={index}>
        <img
          src={url}
          alt={`Slide ${index}`}
          className="w-full h-64 sm:h-80 md:h-96 object-cover"
        />
      </CarouselItem>
    ))}
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>
      </section>

      {/* How Does It Work Section */}
      <section className="text-center mb-12">
        <h2 className="text-2xl font-semibold mb-6">How Does It Work?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-4 bg-white rounded-xl shadow-md">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3756/3756925.png"
              alt="Scan QR"
              className="w-16 h-16 mx-auto mb-3"
            />
            <h3 className="font-semibold">Scan & Browse</h3>
            <p className="text-sm text-gray-600">
              Just scan the QR code on your table to explore the menu instantly.
            </p>
          </div>
          {/* Step 2 */}
          <div className="p-4 bg-white rounded-xl shadow-md">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3523/3523885.png"
              alt="Tap to order"
              className="w-16 h-16 mx-auto mb-3"
            />
            <h3 className="font-semibold">Tap to Order</h3>
            <p className="text-sm text-gray-600">
              Customize and confirm your order in seconds.
            </p>
          </div>
          {/* Step 3 */}
          <div className="p-4 bg-white rounded-xl shadow-md">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3081/3081559.png"
              alt="Food delivery"
              className="w-16 h-16 mx-auto mb-3"
            />
            <h3 className="font-semibold">Food Comes to You</h3>
            <p className="text-sm text-gray-600">
              No waiting, no calling. Just great food, delivered to your table.
            </p>
          </div>
        </div>
      </section>

      {/* Most Popular Section */}
      <section className="text-center">
        <h2 className="text-2xl font-semibold mb-6">The Most Popular</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl overflow-hidden shadow-md">
            <img
              src="https://images.unsplash.com/photo-1604908176965-d1f418b443f8"
              alt="Popular dish 1"
              className="w-full h-56 object-cover"
            />
          </div>
          <div className="bg-white rounded-xl overflow-hidden shadow-md">
            <img
              src="https://images.unsplash.com/photo-1613141411663-b7c19be33622"
              alt="Popular dish 2"
              className="w-full h-56 object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default StaffHome;
