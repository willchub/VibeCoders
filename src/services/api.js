import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

// Map DB row (snake_case) to app shape (camelCase). Build location from lat/lng/address or jsonb.
const rowToListing = (row) => {
  let location = null;
  if (row.lat != null && row.lng != null) {
    location = { lat: Number(row.lat), lng: Number(row.lng), address: row.address || null };
  } else if (row.location && typeof row.location === 'object') {
    location = row.location;
  }
  return {
    id: row.id,
    title: row.title,
    seller: row.seller,
    type: row.type,
    originalPrice: row.original_price,
    discountedPrice: row.discounted_price,
    imageUrl: row.image_url,
    imageUrls: row.image_urls || (row.image_url ? [row.image_url] : null),
    appointmentTime: row.appointment_time,
    rating: row.rating ?? 4.5,
    reviews: row.reviews ?? 0,
    location,
    suburb: row.suburb || null,
    description: row.description || null,
    instagramUrl: row.instagram_url || null,
    status: row.status || 'available',
    sellerId: row.seller_id || null,
  };
};

// Mock data used when Supabase is not configured
// Enriched with description, suburb, imageUrls (carousel), instagramUrl for detail page
const mockListings = [
  {
    id: 1,
    title: "Last-Minute Men's Haircut",
    seller: 'The Dapper Barber',
    type: 'Barbershop',
    originalPrice: 40,
    discountedPrice: 25,
    imageUrl: 'https://images.unsplash.com/photo-1599305445671-ac28a54c44ac?q=80&w=2940&auto=format&fit=crop',
    imageUrls: [
      'https://images.unsplash.com/photo-1599305445671-ac28a54c44ac?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1200&auto=format&fit=crop',
    ],
    appointmentTime: '2026-03-13T16:00:00Z',
    location: { lat: -37.8136, lng: 144.9631, address: '123 Collins St, Melbourne VIC' },
    suburb: 'Melbourne CBD',
    rating: 4.8,
    reviews: 120,
    description: 'A premium barbershop experience in the heart of Melbourne. Our skilled barbers deliver sharp cuts and beard trims in a relaxed, masculine atmosphere. Last-minute slots available when cancellations occur.',
    instagramUrl: 'https://instagram.com/thedapperbarber',
  },
  {
    id: 2,
    title: 'Cancelled Vinyasa Flow Yoga',
    seller: 'Zenith Yoga Studio',
    type: 'Gym Class',
    originalPrice: 25,
    discountedPrice: 15,
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=3000&auto=format&fit=crop',
    imageUrls: [
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=1200&auto=format&fit=crop',
    ],
    appointmentTime: '2026-03-13T18:30:00Z',
    location: { lat: -37.8150, lng: 144.9650, address: '45 Bourke St, Melbourne VIC' },
    suburb: 'Melbourne CBD',
    rating: 4.9,
    reviews: 85,
    description: 'Rejuvenate with our signature Vinyasa Flow class. A cancelled booking means you get this premium studio experience at a fraction of the price. All levels welcome.',
    instagramUrl: 'https://instagram.com/zenithyogastudio',
  },
  {
    id: 3,
    title: 'Open Slot for Gel Manicure',
    seller: 'Nails by Chloe',
    type: 'Salon',
    originalPrice: 55,
    discountedPrice: 40,
    imageUrl: 'https://images.unsplash.com/photo-1604654894610-df644ba33c36?q=80&w=2940&auto=format&fit=crop',
    imageUrls: [
      'https://images.unsplash.com/photo-1604654894610-df644ba33c36?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1609445474565-6f0c6b2e7d1f?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop',
    ],
    appointmentTime: '2026-03-14T11:00:00Z',
    location: { lat: -37.8120, lng: 144.9610, address: '78 Swanston St, Melbourne VIC' },
    suburb: 'Melbourne CBD',
    rating: 4.7,
    reviews: 210,
    description: 'Chloe creates stunning gel manicures that last weeks. Our open slot means you get a full gel mani with nail art at a discount. Walk-ins welcome for last-minute deals.',
    instagramUrl: 'https://instagram.com/nailsbychloe',
  },
  {
    id: 4,
    title: 'Urgent Physio Session Available',
    seller: 'Active Recovery Physio',
    type: 'Physio',
    originalPrice: 90,
    discountedPrice: 60,
    imageUrl: 'https://images.unsplash.com/photo-1581092912335-81539c83393c?q=80&w=2940&auto=format&fit=crop',
    imageUrls: [
      'https://images.unsplash.com/photo-1581092912335-81539c83393c?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format&fit=crop',
    ],
    appointmentTime: '2026-03-14T14:00:00Z',
    location: { lat: -37.8160, lng: 144.9680, address: '200 Exhibition St, Melbourne VIC' },
    suburb: 'Melbourne CBD',
    rating: 5.0,
    reviews: 45,
    description: 'Expert physiotherapy for sports injuries and recovery. A cancelled appointment means you can get same-day treatment at a reduced rate. Fully qualified practitioners.',
    instagramUrl: 'https://instagram.com/activerecoveryphysio',
  },
];

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop';

/**
 * Fetch all listings (public marketplace). Uses Supabase when configured, otherwise returns mock data.
 */
export const getListings = async () => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('status', 'available')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(rowToListing);
  }
  return new Promise((resolve) => {
    setTimeout(() => {
      // In mock mode, treat listings without status as available by default.
      const available = mockListings.filter((l) => !l.status || l.status === 'available');
      resolve([...available]);
    }, 500);
  });
};

/**
 * Fetch a single listing by id. Uses Supabase when configured, otherwise mock.
 */
export const getListingById = async (id) => {
  if (isSupabaseConfigured()) {
    // Supabase `listings.id` is a UUID string, so query by the raw id value.
    const { data, error } = await supabase.from('listings').select('*').eq('id', id).single();
    if (error || !data) return null;
    return rowToListing(data);
  }

  // Mock mode: support both numeric ids and stringified numbers.
  const idNum = typeof id === 'string' && !Number.isNaN(Number(id)) ? Number(id) : id;
  return new Promise((resolve) => {
    setTimeout(() => {
      const listing = mockListings.find((l) => l.id === idNum || l.id === id);
      resolve(listing ? { ...listing } : null);
    }, 200);
  });
};

/**
 * Fetch listings owned by the current business (seller_id = userId). For seller dashboard only.
 */
export const getMyListings = async (userId) => {
  if (!userId) return [];
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('seller_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(rowToListing);
  }
  return new Promise((resolve) => {
    setTimeout(() => {
      const mine = mockListings.filter((l) => l.sellerId === userId);
      resolve(mine);
    }, 300);
  });
};

/**
 * Search listings by service (title, type) and location (address, seller, area).
 * In a real app this would be a backend GET /api/search?service=...&location=...
 */
function matchesService(listing, serviceQuery) {
  if (!serviceQuery || !serviceQuery.trim()) return true;
  const q = serviceQuery.trim().toLowerCase();
  const title = (listing.title || '').toLowerCase();
  const type = (listing.type || '').toLowerCase();
  const seller = (listing.seller || '').toLowerCase();
  return title.includes(q) || type.includes(q) || seller.includes(q);
}

function matchesLocation(listing, locationQuery) {
  if (!locationQuery || !locationQuery.trim()) return true;
  const q = locationQuery.trim().toLowerCase();
  const address = (listing.location?.address || '').toLowerCase();
  const seller = (listing.seller || '').toLowerCase();
  const type = (listing.type || '').toLowerCase();
  return address.includes(q) || seller.includes(q) || type.includes(q);
}

export const searchListings = (serviceQuery, locationQuery) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = mockListings.filter(
        (listing) => matchesService(listing, serviceQuery) && matchesLocation(listing, locationQuery)
      );
      resolve([...filtered]);
    }, 300);
  });
};

/**
 * Create a listing. Requires sellerId (current user id) when using Supabase; business role enforced in UI.
 */
export const createListing = async (listing, sellerId = null) => {
  const appointmentTime = listing.appointmentTime
    ? new Date(listing.appointmentTime).toISOString()
    : new Date().toISOString();

  if (isSupabaseConfigured()) {
    const loc = listing.location;
    const insertRow = {
      title: listing.title || 'Untitled',
      seller: listing.seller || 'My Business',
      type: listing.type || 'Salon',
      original_price: Number(listing.originalPrice) || 0,
      discounted_price: Number(listing.discountedPrice) || 0,
      image_url: listing.imageUrl || DEFAULT_IMAGE,
      appointment_time: appointmentTime,
      rating: 4.5,
      reviews: 0,
      seller_id: sellerId || null,
    };
    if (loc && typeof loc.lat === 'number' && typeof loc.lng === 'number') {
      insertRow.lat = loc.lat;
      insertRow.lng = loc.lng;
      insertRow.address = loc.address || null;
    }
    const { data, error } = await supabase.from('listings').insert(insertRow).select().single();
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
        location: listing.location || null,
        sellerId: sellerId || null,
      };
      mockListings.push(newListing);
      resolve(newListing);
    }, 300);
  });
};

/**
 * Update a listing's location. Uses Supabase when configured, otherwise mock.
 */
export const saveStoreLocation = async (listingId, location) => {
  if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
    throw new Error('Invalid location');
  }
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('listings')
      .update({
        lat: location.lat,
        lng: location.lng,
        address: location.address || null,
      })
      .eq('id', listingId)
      .select()
      .single();
    if (error) throw error;
    return rowToListing(data);
  }
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const id = typeof listingId === 'string' && !Number.isNaN(Number(listingId)) ? Number(listingId) : listingId;
      const listing = mockListings.find((l) => l.id === id || l.id === listingId);
      if (listing) {
        listing.location = { ...location };
        resolve(listing);
      } else {
        reject(new Error('Listing not found'));
      }
    }, 300);
  });
};

/**
 * Record a transaction in Supabase when a booking is completed.
 * No-op if Supabase is not configured.
 * @param {{ listingId, listingTitle, seller, amount, currency?, status?, paymentMethod?, buyerEmail?, userId? }} payload
 */
export const createTransaction = async (payload) => {
  if (!isSupabaseConfigured()) return null;
  const { error } = await supabase.from('transactions').insert({
    listing_id: String(payload.listingId),
    listing_title: payload.listingTitle || null,
    seller: payload.seller || null,
    amount: Number(payload.amount) || 0,
    currency: payload.currency || 'USD',
    status: payload.status || 'completed',
    payment_method: payload.paymentMethod || 'card',
    buyer_email: payload.buyerEmail || null,
    user_id: payload.userId || null,
  });
  if (error) throw error;
  return null;
};

/**
 * Mark a listing as sold after a successful booking.
 * In Supabase mode updates the `status` column; in mock mode flags the in-memory listing.
 */
export const markListingSold = async (listingId) => {
  if (isSupabaseConfigured()) {
    const { error } = await supabase
      .from('listings')
      .update({ status: 'sold' })
      .eq('id', listingId);
    if (error) throw error;
    return;
  }

  const idNum = typeof listingId === 'string' && !Number.isNaN(Number(listingId)) ? Number(listingId) : listingId;
  const target = mockListings.find((l) => l.id === idNum || l.id === listingId);
  if (target) {
    target.status = 'sold';
  }
};

/**
 * Fetch transactions (previous bookings) for the current user. Supabase: by user_id; mock: empty.
 */
export const getMyTransactions = async (userId) => {
  if (!userId) return [];
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('transactions')
      .select('id, created_at, listing_id, listing_title, seller, amount, currency, status, payment_method')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((row) => ({
      id: row.id,
      createdAt: row.created_at,
      listingId: row.listing_id,
      listingTitle: row.listing_title,
      seller: row.seller,
      amount: Number(row.amount),
      currency: row.currency || 'USD',
      status: row.status,
      paymentMethod: row.payment_method,
    }));
  }
  return [];
};

const BUSINESS_PROFILE_KEY = 'lastminute_business_profile';

/**
 * Get business profile (logo, Instagram, photos) for a user. Supabase: from profiles; mock: localStorage.
 */
export const getBusinessProfile = async (userId) => {
  if (!userId) return { logoUrl: '', instagramUrl: '', photoUrls: [] };
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('profiles').select('business_logo_url, business_instagram_url, business_photos').eq('id', userId).single();
    if (error && error.code !== 'PGRST116') throw error;
    const photos = data?.business_photos;
    return {
      logoUrl: data?.business_logo_url || '',
      instagramUrl: data?.business_instagram_url || '',
      photoUrls: Array.isArray(photos) ? photos : [],
    };
  }
  try {
    const raw = localStorage.getItem(`${BUSINESS_PROFILE_KEY}_${userId}`);
    if (!raw) return { logoUrl: '', instagramUrl: '', photoUrls: [] };
    const parsed = JSON.parse(raw);
    return {
      logoUrl: parsed.logoUrl || '',
      instagramUrl: parsed.instagramUrl || '',
      photoUrls: Array.isArray(parsed.photoUrls) ? parsed.photoUrls : [],
    };
  } catch (_) {
    return { logoUrl: '', instagramUrl: '', photoUrls: [] };
  }
};

/**
 * Update business profile. photoUrls = array of image URLs.
 */
export const updateBusinessProfile = async (userId, { logoUrl, instagramUrl, photoUrls }) => {
  if (!userId) throw new Error('User ID required');
  if (isSupabaseConfigured()) {
    const { error } = await supabase
      .from('profiles')
      .update({
        business_logo_url: logoUrl || null,
        business_instagram_url: instagramUrl || null,
        business_photos: Array.isArray(photoUrls) ? photoUrls : [],
      })
      .eq('id', userId);
    if (error) throw error;
    return { logoUrl: logoUrl || '', instagramUrl: instagramUrl || '', photoUrls: photoUrls || [] };
  }
  const payload = {
    logoUrl: logoUrl || '',
    instagramUrl: instagramUrl || '',
    photoUrls: Array.isArray(photoUrls) ? photoUrls : [],
  };
  try {
    localStorage.setItem(`${BUSINESS_PROFILE_KEY}_${userId}`, JSON.stringify(payload));
  } catch (_) {}
  return payload;
};
