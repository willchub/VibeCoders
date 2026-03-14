// A mock database of listings. In a real application, this would come from a backend server.
// Each listing may include location: { lat, lng, address } for map and "near me" search.
const mockListings = [
  {
    id: 1,
    title: "Last-Minute Men's Haircut",
    seller: 'The Dapper Barber',
    type: 'Barbershop',
    originalPrice: 40,
    discountedPrice: 25,
    imageUrl: 'https://images.unsplash.com/photo-1599305445671-ac28a54c44ac?q=80&w=2940&auto=format&fit=crop',
    appointmentTime: '2026-03-13T16:00:00Z',
    location: { lat: -37.8136, lng: 144.9631, address: '123 Collins St, Melbourne VIC' },
    rating: 4.8,
    reviews: 120,
  },
  {
    id: 2,
    title: 'Cancelled Vinyasa Flow Yoga',
    seller: 'Zenith Yoga Studio',
    type: 'Gym Class',
    originalPrice: 25,
    discountedPrice: 15,
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=3000&auto=format&fit=crop',
    appointmentTime: '2026-03-13T18:30:00Z',
    location: { lat: -37.8150, lng: 144.9650, address: '45 Bourke St, Melbourne VIC' },
    rating: 4.9,
    reviews: 85,
  },
  {
    id: 3,
    title: 'Open Slot for Gel Manicure',
    seller: 'Nails by Chloe',
    type: 'Salon',
    originalPrice: 55,
    discountedPrice: 40,
    imageUrl: 'https://images.unsplash.com/photo-1604654894610-df644ba33c36?q=80&w=2940&auto=format&fit=crop',
    appointmentTime: '2026-03-14T11:00:00Z',
    location: { lat: -37.8120, lng: 144.9610, address: '78 Swanston St, Melbourne VIC' },
    rating: 4.7,
    reviews: 210,
  },
  {
    id: 4,
    title: 'Urgent Physio Session Available',
    seller: 'Active Recovery Physio',
    type: 'Physio',
    originalPrice: 90,
    discountedPrice: 60,
    imageUrl: 'https://images.unsplash.com/photo-1581092912335-81539c83393c?q=80&w=2940&auto=format&fit=crop',
    appointmentTime: '2026-03-14T14:00:00Z',
    location: { lat: -37.8160, lng: 144.9680, address: '200 Exhibition St, Melbourne VIC' },
    rating: 5.0,
    reviews: 45,
  },
];

// Simulates an API call to get all listings
export const getListings = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockListings]);
    }, 500); // Simulate network delay
  });
};

// Simulates saving/updating a store's location (in a real app this would POST/PATCH to backend)
export const saveStoreLocation = (listingId, location) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const listing = mockListings.find((l) => l.id === listingId);
      if (listing) {
        listing.location = { ...location };
        resolve(listing);
      } else {
        reject(new Error('Listing not found'));
      }
    }, 300);
  });
};

// Simulates creating a new listing (mutates mock list; new listings appear on next getListings)
export const createListing = (listing) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const id = Math.max(0, ...mockListings.map((l) => l.id)) + 1;
      const now = new Date();
      const appointmentTime = listing.appointmentTime
        ? new Date(listing.appointmentTime).toISOString()
        : now.toISOString();
      const newListing = {
        id,
        title: listing.title || 'Untitled',
        seller: listing.seller || 'My Business',
        type: listing.type || 'Salon',
        originalPrice: Number(listing.originalPrice) || 0,
        discountedPrice: Number(listing.discountedPrice) || 0,
        imageUrl: listing.imageUrl || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop',
        appointmentTime,
        rating: 4.5,
        reviews: 0,
        location: listing.location || null,
      };
      mockListings.push(newListing);
      resolve(newListing);
    }, 300);
  });
};
