import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

/** Turn Supabase/PostgREST error object into a proper Error so runtimes show a readable message. */
function toError(err) {
  if (err instanceof Error) return err;
  const msg = err?.message || err?.error_description || String(err?.code || 'Request failed');
  const e = new Error(msg);
  if (err?.code) e.code = err.code;
  return e;
}

/** True if error indicates a missing column (run missing migrations). */
function isMissingColumnError(err) {
  const msg = (err?.message || '').toLowerCase();
  const missingColumn = msg.includes('does not exist') && (msg.includes('column') || msg.includes('seller_id') || msg.includes('business_logo'));
  const schemaCache = msg.includes('schema cache') && (msg.includes('seller_id') || msg.includes('column'));
  return missingColumn || schemaCache;
}

/** True if we should return empty data instead of throwing (400 = bad request, often missing columns). */
function isRecoverableSchemaError(err) {
  if (!err) return false;
  if (isMissingColumnError(err)) return true;
  const code = err.code ?? err.status;
  if (code === 400 || code === '400') return true;
  const msg = (err?.message || '').toLowerCase();
  return msg.includes('bad request') || msg.includes('400');
}

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

// Mock list used only when Supabase is not configured (e.g. createListing in-memory). No default/seed listings.
const mockListings = [];

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop';

/**
 * Fetch all listings (public marketplace). Only returns non-expired listings (appointment_time in the future).
 */
export const getListings = async () => {
  const nowIso = new Date().toISOString();
  if (isSupabaseConfigured()) {
    const base = () =>
      supabase.from('listings').select('*').gt('appointment_time', nowIso).order('created_at', { ascending: false });
    const { data, error } = await base().eq('status', 'available');
    if (error && isRecoverableSchemaError(error)) {
      const fallback = await base();
      if (fallback.error) throw toError(fallback.error);
      return (fallback.data || []).map(rowToListing);
    }
    if (error) throw toError(error);
    return (data || []).map(rowToListing);
  }
  return new Promise((resolve) => {
    setTimeout(() => {
      const now = Date.now();
      const available = mockListings.filter(
        (l) => (!l.status || l.status === 'available') && new Date(l.appointmentTime || 0).getTime() > now
      );
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
    if (error && error.code !== 'PGRST116') throw toError(error);
    if (!data) return null;
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
 * Fetch listings owned by the current business (seller_id = userId).
 * Also includes listings with seller_id null (e.g. created before column existed) so they appear on My business;
 * after the user edits and saves one, seller_id is set and it stays assigned.
 */
export const getMyListings = async (userId) => {
  if (!userId) return [];
  if (isSupabaseConfigured()) {
    const { data: owned, error: errOwned } = await supabase
      .from('listings')
      .select('*')
      .eq('seller_id', userId)
      .order('created_at', { ascending: false });
    if (errOwned) {
      if (isRecoverableSchemaError(errOwned)) return [];
      throw toError(errOwned);
    }
    const { data: unassigned, error: errUnassigned } = await supabase
      .from('listings')
      .select('*')
      .is('seller_id', null)
      .order('created_at', { ascending: false });
    if (errUnassigned) {
      if (isRecoverableSchemaError(errUnassigned)) return (owned || []).map(rowToListing);
      throw toError(errUnassigned);
    }
    const combined = [...(owned || []), ...(unassigned || [])];
    combined.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    const now = new Date();
    const nowIso = now.toISOString();
    for (const row of combined) {
      const status = row.status || 'available';
      if (status === 'available' && row.appointment_time && new Date(row.appointment_time) < now) {
        try {
          await supabase.from('listings').update({ status: 'expired' }).eq('id', row.id);
        } catch (_) {}
      }
    }
    return combined.map((row) => {
      const listing = rowToListing(row);
      const apt = new Date(row.appointment_time || 0);
      listing.isExpired = listing.status === 'expired' || apt < now;
      if (listing.isExpired && listing.status === 'available') listing.status = 'expired';
      return listing;
    });
  }
  return new Promise((resolve) => {
    setTimeout(() => {
      const now = Date.now();
      const mine = mockListings
        .filter((l) => l.sellerId === userId)
        .map((l) => {
          const isExp = new Date(l.appointmentTime || 0).getTime() < now;
          return { ...l, isExpired: isExp, status: l.status || (isExp ? 'expired' : 'available') };
        });
      resolve(mine);
    }, 300);
  });
};

/** Escape user input for use in Supabase ilike patterns (%, _ are special). */
function escapeIlike(s) {
  if (typeof s !== 'string') return '';
  return s.trim().replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

/**
 * Search listings by service (title, type, seller) and location (address, seller).
 * Uses Supabase when configured; otherwise returns [].
 */
export const searchListings = async (serviceQuery, locationQuery) => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const service = escapeIlike(serviceQuery);
  const location = escapeIlike(locationQuery);

  let query = supabase
    .from('listings')
    .select('*')
    .eq('status', 'available')
    .order('created_at', { ascending: false });

  if (service) {
    const pattern = `%${service}%`;
    query = query.or(`title.ilike.${pattern},type.ilike.${pattern},seller.ilike.${pattern}`);
  }
  if (location) {
    const pattern = `%${location}%`;
    query = query.or(`address.ilike.${pattern},seller.ilike.${pattern}`);
  }

  const { data, error } = await query;
  if (error) throw toError(error);
  return (data || []).map(rowToListing);
};

/**
 * Ensure a profile row exists for the user (id = auth user id). Fixes FK errors when
 * listings.seller_id references public.profiles(id) and the signup trigger didn't create a profile.
 * No-op if Supabase not configured or upsert fails (e.g. RLS); createListing will still be attempted.
 */
export const ensureProfileExists = async (userId, fullName = '') => {
  if (!isSupabaseConfigured() || !userId) return;
  const { error } = await supabase.from('profiles').upsert(
    { id: userId, full_name: fullName || null, updated_at: new Date().toISOString() },
    { onConflict: 'id', ignoreDuplicates: false }
  );
  if (error) {
    // Don't throw; createListing may still work (e.g. if FK is to auth.users), or will show clear FK error
  }
};

/**
 * Create a listing. Requires sellerId (current user id) when using Supabase; business role enforced in UI.
 * If the DB has listings.seller_id referencing public.profiles(id), call ensureProfileExists(userId, fullName) before this.
 */
export const createListing = async (listing, sellerId = null) => {
  const appointmentTime = listing.appointmentTime
    ? new Date(listing.appointmentTime).toISOString()
    : new Date().toISOString();

  if (isSupabaseConfigured()) {
    const loc = listing.location;
    let insertRow = {
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
      status: 'available',
    };
    if (loc && typeof loc.lat === 'number' && typeof loc.lng === 'number') {
      insertRow.lat = loc.lat;
      insertRow.lng = loc.lng;
      insertRow.address = loc.address || null;
    }
    let { data, error } = await supabase.from('listings').insert(insertRow).select().single();
    if (error && isMissingColumnError(error)) {
      const { seller_id: _sid, ...rowWithoutSellerId } = insertRow;
      const { data: d2, error: e2 } = await supabase.from('listings').insert(rowWithoutSellerId).select().single();
      if (e2) throw toError(e2);
      data = d2;
      error = null;
    }
    if (error) {
      const msg = error?.message || '';
      const isFkViolation = msg.toLowerCase().includes('foreign key') || error?.code === '23503';
      if (isFkViolation) {
        throw new Error(
          'Your account is not fully set up in the database. Please sign out, sign in again, then try creating the listing. If it still fails, ensure the "Create a listing" trigger has run (see SUPABASE_SETUP.md) or that your user exists in Authentication.'
        );
      }
      throw toError(error);
    }
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
        status: 'available',
      };
      mockListings.push(newListing);
      resolve(newListing);
    }, 300);
  });
};

/**
 * Update an existing listing. Uses Supabase when configured, otherwise mock.
 * Pass sellerId when the current user should be set as owner (e.g. claiming an unassigned listing).
 */
export const updateListing = async (listingId, listing, sellerId = null) => {
  const appointmentTime = listing.appointmentTime
    ? new Date(listing.appointmentTime).toISOString()
    : undefined;

  if (isSupabaseConfigured()) {
    const loc = listing.location;
    const updateRow = {
      title: listing.title ?? undefined,
      seller: listing.seller ?? undefined,
      type: listing.type ?? undefined,
      original_price: listing.originalPrice != null ? Number(listing.originalPrice) : undefined,
      discounted_price: listing.discountedPrice != null ? Number(listing.discountedPrice) : undefined,
      image_url: listing.imageUrl ?? undefined,
      ...(appointmentTime && { appointment_time: appointmentTime }),
      ...(sellerId && { seller_id: sellerId }),
    };
    if (loc && typeof loc.lat === 'number' && typeof loc.lng === 'number') {
      updateRow.lat = loc.lat;
      updateRow.lng = loc.lng;
      updateRow.address = loc.address || null;
    }
    const filtered = Object.fromEntries(Object.entries(updateRow).filter(([, v]) => v !== undefined));
    const { data, error } = await supabase
      .from('listings')
      .update(filtered)
      .eq('id', listingId)
      .select()
      .single();
    if (error) throw toError(error);
    return rowToListing(data);
  }

  const id = typeof listingId === 'string' && !Number.isNaN(Number(listingId)) ? Number(listingId) : listingId;
  const target = mockListings.find((l) => l.id === id || l.id === listingId);
  if (!target) throw new Error('Listing not found');
  target.title = listing.title ?? target.title;
  target.seller = listing.seller ?? target.seller;
  target.type = listing.type ?? target.type;
  target.originalPrice = listing.originalPrice != null ? Number(listing.originalPrice) : target.originalPrice;
  target.discountedPrice = listing.discountedPrice != null ? Number(listing.discountedPrice) : target.discountedPrice;
  target.imageUrl = listing.imageUrl ?? target.imageUrl;
  if (appointmentTime) target.appointmentTime = appointmentTime;
  if (listing.location) target.location = listing.location;
  return { ...target };
};

/**
 * Delete a listing. Business owners can delete their own listings.
 */
export const deleteListing = async (listingId) => {
  if (isSupabaseConfigured()) {
    const { error } = await supabase.from('listings').delete().eq('id', listingId);
    if (error) throw toError(error);
    return;
  }
  const id = typeof listingId === 'string' && !Number.isNaN(Number(listingId)) ? Number(listingId) : listingId;
  const idx = mockListings.findIndex((l) => l.id === id || l.id === listingId);
  if (idx === -1) throw new Error('Listing not found');
  mockListings.splice(idx, 1);
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
    if (error) throw toError(error);
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
  if (error) throw toError(error);
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
    if (error) throw toError(error);
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
    if (error) throw toError(error);
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
    if (error) {
      if (error.code === 'PGRST116') return { logoUrl: '', instagramUrl: '', photoUrls: [] };
      if (isRecoverableSchemaError(error)) return { logoUrl: '', instagramUrl: '', photoUrls: [] };
      throw toError(error);
    }
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
    if (error) {
      if (isRecoverableSchemaError(error)) return { logoUrl: logoUrl || '', instagramUrl: instagramUrl || '', photoUrls: photoUrls || [] };
      throw toError(error);
    }
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
