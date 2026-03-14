import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

// Map DB row (snake_case) to app shape (camelCase)
const rowToListing = (row) => ({
  id: row.id,
  title: row.title,
  seller: row.seller,
  type: row.type,
  originalPrice: row.original_price,
  discountedPrice: row.discounted_price,
  imageUrl: row.image_url,
  appointmentTime: row.appointment_time,
  rating: row.rating ?? 4.5,
  reviews: row.reviews ?? 0,
});

// Mock data used when Supabase is not configured
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
    rating: 5.0,
    reviews: 45,
  },
];

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop';

/**
 * Fetch all listings. Uses Supabase when configured, otherwise returns mock data.
 */
export const getListings = async () => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(rowToListing);
  }
  return new Promise((resolve) => {
    setTimeout(() => resolve([...mockListings]), 500);
  });
};

/**
 * Create a listing. Uses Supabase when configured, otherwise mutates mock array.
 */
export const createListing = async (listing) => {
  const appointmentTime = listing.appointmentTime
    ? new Date(listing.appointmentTime).toISOString()
    : new Date().toISOString();

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('listings')
      .insert({
        title: listing.title || 'Untitled',
        seller: listing.seller || 'My Business',
        type: listing.type || 'Salon',
        original_price: Number(listing.originalPrice) || 0,
        discounted_price: Number(listing.discountedPrice) || 0,
        image_url: listing.imageUrl || DEFAULT_IMAGE,
        appointment_time: appointmentTime,
        rating: 4.5,
        reviews: 0,
      })
      .select()
      .single();
    if (error) throw error;
    return rowToListing(data);
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      const id = Math.max(0, ...mockListings.map((l) => l.id)) + 1;
      const newListing = {
        id,
        title: listing.title || 'Untitled',
        seller: listing.seller || 'My Business',
        type: listing.type || 'Salon',
        originalPrice: Number(listing.originalPrice) || 0,
        discountedPrice: Number(listing.discountedPrice) || 0,
        imageUrl: listing.imageUrl || DEFAULT_IMAGE,
        appointmentTime,
        rating: 4.5,
        reviews: 0,
      };
      mockListings.push(newListing);
      resolve(newListing);
    }, 300);
  });
};
