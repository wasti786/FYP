
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { itineraryAgent, budgetAgent, mapAgent, imageAgent, foodAgent } from "../agents";
import apiService from "../services/apiService";
import "../CSS/generatePlan.css";
import TripMap from "../components/TripMap";
import HotelCarousel from "../components/HotelCarousel";

const fallbackSVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#f1f5f9"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
            font-family="Arial" font-size="20" fill="#94a3b8">
        No Image
      </text>
    </svg>
  `);

export default function GeneratePlan() {
  const navigate = useNavigate();
  const location = useLocation();

  // Payload from Planner page or fallback
  const [payload] = useState(() => {
    const state = location.state || {};
    return {
      destination: state.destination || "Gilgit Baltistan",
      startDate: state.startDate || "2026-01-29",
      endDate: state.endDate || "2026-01-31",
      travelers: state.travelers || "Couple (2 people)",
      budget: state.budget || "Standard ($1,000 - $2,000)",
      preferences: state.preferences || "Wildlife, nature, sightseeing",
      isSavedTrip: !!state.plan,
      plan: state.plan || null,
    };
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState(null);
  const [budget, setBudget] = useState(null);
  const [activeDay, setActiveDay] = useState(0);
  const [toast, setToast] = useState("");
  const [selectedMapActivity, setSelectedMapActivity] = useState(null);
  const [saving, setSaving] = useState(false);
  const [placeImages, setPlaceImages] = useState({});
  const [destinationImage, setDestinationImage] = useState("");
  const [hotelSuggestions, setHotelSuggestions] = useState([]);
  const [showHotelsEditor, setShowHotelsEditor] = useState(false);
  const [hotelsEditorLoading, setHotelsEditorLoading] = useState(false);
  // Helper: deterministic local image picker and hotel image getter
  const hashString = (s) => {
    if (!s) return 0;
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = (h << 5) - h + s.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  };

  const getHotelImage = (h) => {
    if (!h) return fallbackSVG;
    if (h.imageUrl) return h.imageUrl;
    try {
      const key = `hotel:${(h.name || '').trim()}::${payload.destination}`;
      const cached = imageAgent && imageAgent.hotelCache && imageAgent.hotelCache[key];
      if (cached) return cached;
    } catch (e) {
      // ignore
    }
    if (imageAgent && imageAgent.localHotelImages && imageAgent.localHotelImages.length > 0) {
      const idx = hashString(h.name || '') % imageAgent.localHotelImages.length;
      console.log('GeneratePlan.getHotelImage using local fallback index', idx, 'url', imageAgent.localHotelImages[idx], 'for', h && h.name);
      return imageAgent.localHotelImages[idx];
    }
    // fallback to data SVG
    console.log('GeneratePlan.getHotelImage falling back to SVG for', h && h.name);
    return fallbackSVG;
  };
  // If the user's selected budget has an explicit numeric max (e.g. "Under $500"),
  // try to replace expensive hotels with cheaper alternatives so final accommodation
  // costs fit under the cap. This attempts to minimally replace hotels using
  // `apiService.generateHotels` (budget-level) and `imageAgent` for images.
  const adjustHotelsToBudget = async (itinerary) => {
    try {
      if (!itinerary || !Array.isArray(itinerary.hotels) || itinerary.hotels.length === 0) return itinerary;
      const capInfo = budgetAgent.parseBudgetLabel ? budgetAgent.parseBudgetLabel(payload.budget) : null;
      const cap = capInfo && capInfo.max ? capInfo.max : null;
      if (!cap) return itinerary; // no explicit cap to enforce

      const duration = (() => {
        try {
          const s = new Date(payload.startDate);
          const e = new Date(payload.endDate);
          const diff = Math.max(1, Math.ceil((e - s) / (1000 * 60 * 60 * 24)));
          return diff;
        } catch (e) {
          return 1;
        }
      })();

      const travelerMultiplier = budgetAgent.getTravelerMultiplier ? budgetAgent.getTravelerMultiplier(payload.travelers) : 1;
      const tMult = travelerMultiplier > 1 ? travelerMultiplier / 2 : travelerMultiplier;

      const proportions = budgetAgent.getBudgetProportions ? budgetAgent.getBudgetProportions(payload.budget) : { accommodation: 0.35 };
      const accommodationAllowance = Math.round(cap * (proportions.accommodation || 0.35));

      // Compute current accommodation cost using available hotel prices (average)
      const prices = (itinerary.hotels || []).map((h) => budgetAgent.parsePrice ? budgetAgent.parsePrice(h.price) : 0).filter(Boolean);
      if (prices.length === 0) return itinerary;
      const avgPrice = Math.round(prices.reduce((s, v) => s + v, 0) / prices.length);
      const currentAccommodation = avgPrice * duration * tMult;

      if (currentAccommodation <= accommodationAllowance) return itinerary; // already fits

      // Request budget-oriented hotels and try to pick a cheaper set
      let candidates = [];
      try {
        candidates = await apiService.generateHotels(payload.destination, payload.travelers, "Budget");
      } catch (e) {
        console.warn('generateHotels failed while adjusting to budget', e);
        candidates = [];
      }

      if (!Array.isArray(candidates) || candidates.length === 0) return itinerary;

      const mapped = candidates
        .map((c) => ({ ...c, priceNum: budgetAgent.parsePrice ? budgetAgent.parsePrice(c.price) : 0 }))
        .filter((c) => c.priceNum > 0)
        .sort((a, b) => a.priceNum - b.priceNum);

      if (mapped.length === 0) return itinerary;

      const needed = itinerary.hotels.length;
      const chosen = mapped.slice(0, needed);
      const chosenAvg = Math.round(chosen.reduce((s, h) => s + h.priceNum, 0) / chosen.length);
      const chosenAccommodation = chosenAvg * duration * tMult;

      if (chosenAccommodation > accommodationAllowance) {
        // Even cheapest generated hotels don't fit perfectly; still replace with cheapest available
        console.warn('Even cheapest candidate hotels exceed accommodation allowance — using cheapest available set');
      }

      // Attach images (use imageAgent to attempt better images)
      const replacementHotels = chosen.map((h) => ({ ...h, price: h.price || `$${h.priceNum}/night` }));
      try {
        const enriched = await imageAgent.fetchHotelImages(replacementHotels, payload.destination);
        return { ...itinerary, hotels: enriched };
      } catch (e) {
        // fallback: return hotels without enrichment
        return { ...itinerary, hotels: replacementHotels };
      }
    } catch (e) {
      console.warn('adjustHotelsToBudget error', e);
      return itinerary;
    }
  };
  const [agentStatus, setAgentStatus] = useState({
    itinerary: "pending",
    budget: "pending",
    map: "pending",
  });

  // Day editor states
  const [showDayEditor, setShowDayEditor] = useState(false);
  const [editDayIndex, setEditDayIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [resultDaySelection, setResultDaySelection] = useState({});
  const maxPlacesPerDay = 4;
  const [suggestedPlaces, setSuggestedPlaces] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState("");

  // ---------- Generate Plan with Agents (ONLY FOR NEW TRIPS) ----------
  const generatePlan = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("🚀 Starting AI Agents for new trip...");
      console.log("Destination:", payload.destination);
      console.log("Budget:", payload.budget);
      console.log("Travelers:", payload.travelers);

      // Step 1: Itinerary Agent - Generate the plan
      setAgentStatus((prev) => ({ ...prev, itinerary: "working" }));
      console.log("🤖 Itinerary Agent is planning your trip...");

      const itinerary = await itineraryAgent.generateItinerary(
        payload.destination,
        payload.startDate,
        payload.endDate,
        payload.preferences,
        payload.travelers,
      );

      if (!itinerary || !itinerary.days) {
        throw new Error("Invalid itinerary response");
      }

      console.log("✅ Itinerary generated:", itinerary.days.length, "days");

      // Enrich itinerary: replace generic placeholders with real attractions when needed
      const enrichedItinerary = await enrichItineraryPlaces(itinerary, payload.destination);
      console.log("✅ Itinerary enriched");
      setPlan(enrichedItinerary);
      setAgentStatus((prev) => ({ ...prev, itinerary: "done" }));

      // Step 2: Budget Agent - Calculate budget (uses budget level from payload)
      setAgentStatus((prev) => ({ ...prev, budget: "working" }));
      console.log("🤖 Budget Agent is calculating your budget...");

      const budgetData = budgetAgent.calculateBudget(enrichedItinerary || itinerary, {
        ...payload,
        budgetLevel: payload.budget,
      });
      console.log("✅ Budget calculated:", budgetData.total);
      // Keep baseline budget for compatibility and also compute an optimized suggestion
      const guessedAccommodation = payload.budget?.toLowerCase()?.includes("budget")
        ? "budget"
        : payload.budget?.toLowerCase()?.includes("luxury")
        ? "luxury"
        : "standard";

      const optimized = budgetAgent.optimizeBudget(itinerary, {
        destination: payload.destination,
        startDate: payload.startDate,
        endDate: payload.endDate,
        travelers: payload.travelers,
        budget: payload.budget,
        accommodationType: guessedAccommodation,
        transportMode: "public",
        activityIntensity: "medium",
        foodPreference: "restaurant",
      });

      // maintain backward-compatible top-level fields while adding optimized data
      setBudget({ ...budgetData, original: budgetData, optimized });
      setAgentStatus((prev) => ({ ...prev, budget: "done" }));

      // Step 3: Map Agent - Add coordinates
      setAgentStatus((prev) => ({ ...prev, map: "working" }));
      console.log("🤖 Map Agent is adding coordinates to places...");

      // Update coordinates for the (possibly) enriched itinerary
      const itineraryWithCoords = await mapAgent.processItineraryCoordinates(
        enrichedItinerary || itinerary,
        payload.destination,
      );

      // Fetch hotel images (ensures unique images and caches them)
      const hotelsWithImages = await imageAgent.fetchHotelImages(itineraryWithCoords.hotels || [], payload.destination);
      // Save generated suggestions separately so users can browse/add
      try {
        setHotelSuggestions(hotelsWithImages || []);
      } catch (e) {
        console.warn('Failed to set hotel suggestions', e);
      }

      // Fetch images for all places (prefetch to display realistic photos)
      const allPlaces = [];
      for (const d of (itineraryWithCoords.days || [])) {
        for (const p of (d.places || [])) {
          // preserve potential photoUrl and coordinates from enrichment
          allPlaces.push({ name: p.name, photoUrl: p.photoUrl || null, lat: p.lat || null, lng: p.lng || null });
        }
      }
      try {
        const imagesMap = await imageAgent.fetchImagesForPlaces(allPlaces);
        setPlaceImages((prev) => ({ ...prev, ...imagesMap }));
      } catch (e) {
        console.warn('Failed to prefetch place images', e);
      }

      // Generate food recommendations with images
      const foodRecommendations = await foodAgent.generateFoodRecommendations(payload.destination);

      const finalItinerary = { ...itineraryWithCoords, hotels: hotelsWithImages, food: foodRecommendations };
      // Ensure at least 3 places per day initially so the user has choices
      const filled = await ensureThreePlacesPerDay(finalItinerary, payload.destination);
      const deduped = dedupeItineraryPlaces(filled);
      setPlan(deduped);
      console.log("Generated plan hotels:", (deduped.hotels || []).map(h => ({ name: h.name, keys: Object.keys(h), imageUrl: h.imageUrl })));
      // Ensure hotels have useful images: try Google Place photos first for better accuracy, then fallback to ImageAgent
      const ensureHotelImages = async (itinerary) => {
        try {
          if (!itinerary || !Array.isArray(itinerary.hotels)) return;
          let changed = false;
          const hotelsArr = itinerary.hotels || [];
          for (let i = 0; i < hotelsArr.length; i++) {
            const h = hotelsArr[i];
            const hasImage = !!(h && h.imageUrl && !h.imageUrl.includes('placeholder') && !h.imageUrl.includes('via.placeholder'));
            if (!hasImage) {
              // Try Google Places photo when available
              try {
                if (mapAgent && mapAgent.searchGooglePlacesText) {
                  const q = `${h.name} ${payload.destination}`;
                  const res = await mapAgent.searchGooglePlacesText(q, 1);
                  if (res && res.length > 0 && res[0].photos && res[0].photos.length > 0) {
                    const pr = res[0].photos[0].photo_reference;
                    const gUrl = mapAgent.getGooglePlacePhotoUrl(pr, 800);
                    if (gUrl) {
                      hotelsArr[i].imageUrl = gUrl;
                      changed = true;
                      continue;
                    }
                  }
                }
              } catch (e) {
                console.warn('Google photo lookup failed for hotel', h.name, e);
              }

              // Final fallback: use ImageAgent to fetch Unsplash/source images
              try {
                const fetched = await imageAgent.fetchHotelImages([h], payload.destination);
                if (Array.isArray(fetched) && fetched[0] && fetched[0].imageUrl) {
                  hotelsArr[i].imageUrl = fetched[0].imageUrl;
                  changed = true;
                }
              } catch (e) {
                console.warn('ImageAgent fetchHotelImages fallback failed for', h.name, e);
              }
            }
          }

          if (changed) {
            const updated = { ...itinerary, hotels: hotelsArr };
            setPlan(updated);
            console.log('Updated hotels with better images where available');
          }
        } catch (e) {
          console.warn('ensureHotelImages error', e);
        }
      };

      // Run the image ensuring step and then try to adjust hotels to fit explicit numeric budget caps
      await ensureHotelImages(deduped).catch((e) => console.warn('ensureHotelImages failed', e));
      try {
        const adjusted = await adjustHotelsToBudget(deduped);
        if (adjusted && adjusted.hotels && JSON.stringify(adjusted.hotels) !== JSON.stringify(deduped.hotels)) {
          setPlan(adjusted);
          // Recalculate budget and optimized breakdown for the adjusted plan
          try {
            const newBudgetData = await budgetAgent.calculateBudget(adjusted, { ...payload, budgetLevel: payload.budget });
            const newOptimized = await budgetAgent.optimizeBudget(adjusted, { ...payload, budget: payload.budget });
            setBudget({ ...newBudgetData, original: newBudgetData, optimized: newOptimized });
            console.log('Adjusted hotels to fit budget cap and recalculated budget');
          } catch (e) {
            console.warn('Failed to recalculate budget after hotel adjustment', e);
          }
        }
      } catch (e) {
        console.warn('adjustHotelsToBudget failed', e);
      }
      console.log("✅ Map coordinates added");
      setAgentStatus((prev) => ({ ...prev, map: "done" }));

      // Step 4: Fetch destination cover image
      await fetchDestinationImage(payload.destination);

      setActiveDay(0);
      setLoading(false);
    } catch (err) {
      console.error("Generate Plan Error:", err);
      setError(
        err.message || "Failed to generate itinerary. Please try again.",
      );
      setLoading(false);
    }
  };

  // ---------- Fetch Destination Cover Image ----------
  const fetchDestinationImage = async (destination) => {
    try {
      const imageUrl = await imageAgent.fetchImageForDestination(destination);
      setDestinationImage(imageUrl);
    } catch (error) {
      console.error("Error fetching destination image:", error);
      setDestinationImage("");
    }
  };

  // Generate food suggestions on demand (used for saved trips or manual refresh)
  const generateFoodSuggestions = async () => {
    try {
      setToast('⏳ Generating food suggestions...');
      let recs = [];
      if (foodAgent && foodAgent.generateFoodRecommendations) {
        try {
          recs = await foodAgent.generateFoodRecommendations(payload.destination);
        } catch (e) {
          console.warn('foodAgent.generateFoodRecommendations failed', e);
          recs = [];
        }
      }

      // Fallback to agent static pool if available
      if ((!recs || recs.length === 0) && foodAgent && typeof foodAgent._foodsForDestination === 'function') {
        try {
          recs = foodAgent._foodsForDestination(payload.destination || '') || [];
        } catch (e) {
          recs = [];
        }
      }

      // Final static fallback
      if (!recs || recs.length === 0) {
        const k = (payload.destination || '').toLowerCase();
        const defaults = {
          lahore: [
            { name: 'Nihari', description: 'Slow-cooked beef stew, a Lahore favorite.', type: 'Main' },
            { name: 'Halwa Puri', description: 'Breakfast staple — sweet halwa and fried bread.', type: 'Breakfast' },
            { name: 'Biryani', description: 'Fragrant rice with spiced meat.', type: 'Main' },
            { name: 'Chargha', description: 'Whole fried spiced chicken.', type: 'Main' },
            { name: 'Lahori Fried Fish', description: 'Crispy spiced river fish.', type: 'Street' },
            { name: 'Seekh Kebab', description: 'Minced meat skewer.', type: 'Street' }
          ],
          default: [
            { name: 'Local Thali', description: 'A platter of regional specialties to try.', type: 'Local' },
            { name: 'Street Kebab', description: 'Grilled meat with bread and chutney.', type: 'Street' },
            { name: 'Regional Stew', description: 'Hearty stew featuring local ingredients.', type: 'Traditional' },
            { name: 'Sweet Treat', description: 'Popular local dessert to finish the meal.', type: 'Dessert' },
            { name: 'Breakfast Special', description: 'Typical local breakfast item.', type: 'Breakfast' },
            { name: 'Local Snack', description: 'Popular snack to try.', type: 'Snack' }
          ]
        };
        recs = defaults[k] || defaults.default;
      }

      // Dedupe
      const seen = new Set();
      let items = (Array.isArray(recs) ? recs : []).filter((it) => {
        const n = (it && it.name) ? it.name.trim().toLowerCase() : '';
        if (!n || seen.has(n)) return false;
        seen.add(n);
        return true;
      });

      // Shuffle and take up to 6
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }
      items = items.slice(0, 6);

      // Ensure each item has an image (try imageAgent, otherwise source.unsplash)
      const withImages = [];
      for (const it of items) {
        let imageUrl = (it && it.imageUrl) ? it.imageUrl : '';
        if (!imageUrl) {
          try {
            if (imageAgent && typeof imageAgent.fetchFoodImage === 'function') {
              imageUrl = await imageAgent.fetchFoodImage(`${it.name} ${payload.destination}`);
            }
          } catch (e) {
            // ignore
          }
        }
        if (!imageUrl) imageUrl = `https://source.unsplash.com/400x300/?${encodeURIComponent(it.name + ' ' + payload.destination + ' food')}`;
        withImages.push({ name: it.name, description: it.description || '', type: it.type || '', imageUrl });
      }

      setPlan((prev) => ({ ...(prev || {}), food: withImages }));
      showToast('🍽️ Food suggestions loaded');
    } catch (e) {
      console.warn('generateFoodSuggestions failed', e);
      setPlan((prev) => ({ ...(prev || {}), food: [] }));
      showToast('Failed to generate food suggestions');
    }
  };

  // ---------- Load Saved Trip (NO API CALLS) ----------
  const loadSavedTrip = () => {
    try {
      console.log("📀 Loading saved trip - NO API CALLS");
      console.log("Saved plan:", payload.plan);

      if (!payload.plan || !payload.plan.days) {
        console.error("Invalid saved plan data");
        setError("Invalid saved trip data. Please try again.");
        setLoading(false);
        return;
      }

      console.log("Saved plan days:", payload.plan.days.length);
      const normalizedPlan = dedupeItineraryPlaces(payload.plan);
      setPlan(normalizedPlan);

      // Normalize legacy `food` object shape (breakfast/lunch/dinner/suggestions) into a flat array of items
      try {
        if (normalizedPlan && normalizedPlan.food && !Array.isArray(normalizedPlan.food)) {
          const f = normalizedPlan.food || {};
          const arr = [];
          const seen = new Set();
          const pushItem = (it) => {
            if (!it) return;
            const name = (it.name || '').trim();
            if (!name) return;
            const key = name.toLowerCase();
            if (seen.has(key)) return;
            seen.add(key);
            arr.push({ name: it.name, description: it.description || '', imageUrl: it.imageUrl || '' });
          };
          ['breakfast', 'lunch', 'dinner'].forEach((m) => {
            (Array.isArray(f[m]) ? f[m] : []).forEach(pushItem);
          });
          if (f.suggestions) {
            if (Array.isArray(f.suggestions)) f.suggestions.forEach(pushItem);
            else if (typeof f.suggestions === 'object') {
              ['breakfast', 'lunch', 'dinner'].forEach((m) => (Array.isArray(f.suggestions[m]) ? f.suggestions[m] : []).forEach(pushItem));
            }
          }
          if (arr.length === 0 && Array.isArray(payload.plan.food)) arr.push(...payload.plan.food);
          if (arr.length > 0) {
            setPlan((prev) => ({ ...(prev || {}), food: arr }));
            normalizedPlan.food = arr;
          }
        }
      } catch (e) {
        console.warn('Failed to normalize saved plan food shape', e);
      }

      // Ensure hotels in saved plan have images. Try ImageAgent first, then fall back
      // to Unsplash source URLs so the UI always shows a photo.
      (async () => {
        try {
          const hotelsArr = (normalizedPlan.hotels || []).map(h => ({ ...(h || {}) }));
          const needFetch = hotelsArr.some(h => !h.imageUrl || (typeof h.imageUrl === 'string' && h.imageUrl.trim() === ''));
          if (needFetch) {
            let enriched = hotelsArr;
            if (imageAgent && imageAgent.fetchHotelImages) {
              try {
                enriched = await imageAgent.fetchHotelImages(hotelsArr, payload.destination);
              } catch (err) {
                console.warn('imageAgent.fetchHotelImages failed for saved trip, falling back to Unsplash', err);
              }
            }

            // Final fallback: assign a source.unsplash image per hotel if still missing
            enriched = (enriched || hotelsArr).map((h) => {
              if (h && h.imageUrl) return h;
              const q = encodeURIComponent((h && h.name) ? `${h.name} ${payload.destination} hotel` : `hotel ${payload.destination}`);
              return { ...h, imageUrl: `https://source.unsplash.com/800x600/?${q}` };
            });

            setPlan((prev) => ({ ...prev, hotels: enriched }));
          }
        } catch (e) {
          console.warn('Failed to populate hotel images for saved trip', e);
        }
      })();

      // Ensure food suggestions exist for saved trips — prefer saved payload, otherwise try foodAgent, fallback to small defaults
      (async () => {
        try {
          if (!normalizedPlan.food || (Array.isArray(normalizedPlan.food) && normalizedPlan.food.length === 0)) {
            let foods = (payload.plan && payload.plan.food) ? payload.plan.food : [];
            if ((!foods || foods.length === 0) && foodAgent && foodAgent.generateFoodRecommendations) {
              try {
                const recs = await foodAgent.generateFoodRecommendations(payload.destination);
                if (recs && recs.length > 0) foods = recs;
              } catch (err) {
                console.warn('foodAgent.generateFoodRecommendations failed for saved trip', err);
              }
            }

            if (!foods || foods.length === 0) {
              const k = (payload.destination || '').toLowerCase();
              const defaults = {
                lahore: [
                  { name: 'Nihari', description: 'Slow-cooked beef stew, a Lahore favorite.', type: 'Main' },
                  { name: 'Halwa Puri', description: 'Breakfast staple with sweet halwa and fried bread.', type: 'Breakfast' },
                ],
                hunza: [
                  { name: 'Chapshuro', description: 'Meat and onion flatbread from Hunza.', type: 'Snack' },
                ],
                default: [
                  { name: 'Local Special', description: `Popular dishes in ${payload.destination}`, type: 'Local' }
                ]
              };
              foods = defaults[k] || defaults.default;
            }

            setPlan((prev) => ({ ...(prev || {}), food: foods }));
          }
        } catch (err) {
          console.warn('Failed to populate food for saved trip', err);
        }
      })();

      // Set budget from saved data or from plan
      if (payload.plan.budget) {
        try {
          const saved = payload.plan.budget;
          // Normalize older/newer saved shapes: some saves store the useful fields
          // under `original` (and have `optimized`/`savings` alongside). If so,
          // prefer `original` as the baseline so top-level UI fields exist.
          let normalized = saved;
          if (saved && typeof saved === "object" && saved.original) {
            const original = saved.original || {};
            normalized = {
              // prefer top-level values from the original snapshot
              total: original.total ?? original?.total ?? null,
              daily: original.daily ?? original?.daily ?? null,
              breakdown: original.breakdown ?? original?.breakdown ?? null,
              recommendations: original.recommendations ?? saved.recommendations ?? [],
              currency: original.currency ?? saved.currency ?? "USD",
              budgetLevel: saved.budgetLevel ?? original.budgetLevel ?? payload.budget ?? "Standard",
              // keep history
              original: original,
              optimized: saved.optimized ?? null,
              savings:
                saved.savings ??
                (saved.optimized && original && original.total
                  ? original.total - (saved.optimized.total ?? 0)
                  : 0),
            };
          }

          setBudget(normalized);
        } catch (e) {
          console.warn("Failed to normalize saved budget, using raw value", e);
          setBudget(payload.plan.budget);
        }
      } else if (payload.budget) {
        const duration = itineraryAgent.calculateDays(
          payload.startDate,
          payload.endDate,
        );
        const travelerCount = payload.travelers?.includes("Solo")
          ? 1
          : payload.travelers?.includes("Couple")
            ? 2
            : 3;
        
        // Parse budget level from string
        let dailyRate = 150; // Default Standard
        if (payload.budget?.includes("Budget")) dailyRate = 80;
        else if (payload.budget?.includes("Economy")) dailyRate = 120;
        else if (payload.budget?.includes("Standard")) dailyRate = 150;
        else if (payload.budget?.includes("Premium")) dailyRate = 250;
        else if (payload.budget?.includes("Luxury")) dailyRate = 400;
        
        const total = dailyRate * duration * travelerCount;

        setBudget({
          total,
          daily: total / duration,
          breakdown: {
            accommodation: total * 0.4,
            food: total * 0.25,
            transport: total * 0.15,
            activities: total * 0.15,
            miscellaneous: total * 0.05,
          },
          recommendations: [
            "Book accommodations in advance for better rates",
            "Use local transportation to save money",
            "Look for combo deals for attractions",
          ],
          currency: "USD",
          budgetLevel: payload.budget,
        });
      } else {
        setBudget({
          total: 0,
          daily: 0,
          breakdown: {
            accommodation: 0,
            food: 0,
            transport: 0,
            activities: 0,
            miscellaneous: 0,
          },
          recommendations: [],
          currency: "USD",
        });
      }

      fetchDestinationImage(payload.destination);
      setActiveDay(0);
      setLoading(false);
      console.log("✅ Saved trip loaded successfully!");
    } catch (err) {
      console.error("Error loading saved trip:", err);
      setError("Failed to load saved trip: " + err.message);
      setLoading(false);
    }
  };

  // ---------- Initialize Component ----------
  useEffect(() => {
    console.log("Component initialized");
    console.log("Payload budget:", payload.budget);

    if (payload.plan?.days?.length > 0) {
      console.log("📀 SAVED TRIP DETECTED - Loading directly");
      loadSavedTrip();
    } else if (payload.isSavedTrip) {
      setError("Saved trip data is incomplete.");
      setLoading(false);
    } else {
      console.log("🆕 NEW TRIP - Calling API to generate plan");
      generatePlan();
    }
  }, []);

  // ---------- Fetch images for current day's places ----------
  useEffect(() => {
    const loadImages = async () => {
      if (!plan || loading) return;

      const places = plan.days?.[activeDay]?.places || [];
      if (places.length === 0) return;

      const needImages = places.some((place) => !placeImages[place.name]);
      if (!needImages) return;

      console.log(`🖼️ Fetching images for Day ${activeDay + 1}...`);

      const images = await imageAgent.fetchImagesForDay(places);
      setPlaceImages((prev) => ({ ...prev, ...images }));
    };

    loadImages();
  }, [activeDay, plan, loading]);

  // ---------- Helpers ----------
  const itineraryDays = plan?.days || [];
  const hotels = plan?.hotels || [];
  const travelTips = plan?.travelTips || [];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Ensure places are unique across days (simple dedupe)
  const dedupeItineraryPlaces = (itinerary) => {
    try {
      if (!itinerary || !Array.isArray(itinerary.days)) return itinerary;
      const seen = new Set();
      const destinationName = itinerary.destination || payload.destination || "";
      const newDays = itinerary.days.map((day) => {
        const filtered = [];
        for (const p of (day.places || [])) {
          const name = (p?.name || "").trim();
          const key = name.toLowerCase();
          if (!key) continue;
          if (!seen.has(key)) {
            seen.add(key);
            filtered.push(p);
          }
        }

        // If no unique places remain for this day, add a sensible fallback
        if (filtered.length === 0) {
          const fallbackName = `Local attractions in ${destinationName || 'this area'}`;
          const fallbackKey = fallbackName.toLowerCase();
          if (!seen.has(fallbackKey)) {
            seen.add(fallbackKey);
            filtered.push({ name: fallbackName, description: `Explore local markets, viewpoints and cultural spots in ${destinationName || 'the area'}.` });
          } else {
            // keep first original place if nothing else
            const orig = (day.places || [])[0];
            if (orig) filtered.push(orig);
          }
        }

        return { ...day, places: filtered };
      });

      return { ...itinerary, days: newDays };
    } catch (e) {
      console.warn('Failed to dedupe itinerary places', e);
      return itinerary;
    }
  };

  // Enrich itinerary by replacing generic placeholders with curated attractions
  const enrichItineraryPlaces = async (itinerary, destination) => {
    try {
      if (!itinerary || !Array.isArray(itinerary.days)) return itinerary;

      const key = (destination || "").toLowerCase();

      const attractionsMap = {
        "skardu": [
          { name: 'Shangrila Resort (Lower Kachura)', description: 'Scenic resort with boating and lakeside views.' },
          { name: 'Upper Kachura Lake', description: 'Crystal clear lake with mountain backdrop.' },
          { name: 'Manthoka Waterfall', description: 'Picturesque waterfall and picnic spot.' },
          { name: 'Deosai National Park', description: 'High-altitude plateau with vast plains and wildlife.' },
          { name: 'Satpara Lake', description: 'Freshwater lake ideal for boating and photography.' },
          { name: 'Shigar Fort', description: 'Historic fort and cultural museum.' },
          { name: 'Khaplu Fort', description: 'Beautifully restored fort with valley views.' },
          { name: 'Attabad Lake', description: 'Striking turquoise lake formed after a landslide.' },
          { name: 'Katpana Desert', description: 'Cold desert with sand dunes and unique landscapes.' }
        ],
        "gilgit": [
          { name: 'Naltar Valley', description: 'Valley known for alpine forests and skiing.' },
          { name: 'Bagrot Valley', description: 'Scenic valley with terraced fields and glaciers.' },
          { name: 'Kargah Buddha', description: 'Ancient rock carving and historic site.' },
          { name: 'Central Gilgit Bazaar', description: 'Local market for crafts and snacks.' },
          { name: 'Astore Valley Viewpoint', description: 'Panoramic views of surrounding peaks.' }
        ],
        "hunza": [
          { name: 'Baltit Fort', description: 'Ancient fort overlooking Karimabad.' },
          { name: 'Altit Fort', description: 'Historic fort with cultural displays.' },
          { name: 'Attabad Lake', description: 'Turquoise lake popular for boat rides.' },
          { name: 'Passu Cones', description: 'Iconic jagged mountain peaks, great for photos.' },
          { name: 'Eagle Nest Viewpoint', description: 'Sunset viewpoint with panoramic valley views.' }
        ],
        "lahore": [
          { name: 'Badshahi Mosque', description: 'Iconic Mughal-era mosque.' },
          { name: 'Lahore Fort', description: 'Historic fort with museums and gardens.' },
          { name: 'Shalimar Gardens', description: 'Beautiful Mughal gardens and terraces.' },
          { name: 'Wagah Border', description: 'Daily flag-lowering ceremony and patriotic show.' },
          { name: 'Food Street (Gawalmandi)', description: 'Famous street for Lahori cuisine.' }
        ],
        "karachi": [
          { name: 'Quaid-e-Azam Mausoleum', description: 'Resting place of Pakistan’s founder.' },
          { name: 'Clifton Beach', description: 'Popular seaside promenade and sunset spot.' },
          { name: 'Mohatta Palace', description: 'Museum showcasing art and history.' },
          { name: 'Empress Market', description: 'Historic market with spices and handicrafts.' },
          { name: 'Frere Hall', description: 'Colonial-era building and surrounding gardens.' }
        ],
        "islamabad": [
          { name: 'Faisal Mosque', description: 'Modern mosque with striking architecture.' },
          { name: 'Daman-e-Koh', description: 'Hilltop viewpoint overlooking the city.' },
          { name: 'Pakistan Monument', description: 'National monument with museum and views.' },
          { name: 'Lok Virsa Museum', description: 'Museum of regional cultures and crafts.' },
          { name: 'Rawal Lake', description: 'Recreational lake with picnic spots.' }
        ],
        "naran": [
          { name: 'Lake Saif-ul-Malook', description: 'Alpine lake with dramatic mountain scenery.' },
          { name: 'Babusar Pass', description: 'High mountain pass with panoramic views.' },
          { name: 'Lulusar Lake', description: 'Scenic lake along the Kaghan Valley.' }
        ],
        "default": [
          { name: 'City Centre', description: 'Central area with shops and cafes.' },
          { name: 'Local Market', description: 'Best place to experience local food and crafts.' },
          { name: 'Historic Landmark', description: 'Key cultural or historic site worth visiting.' },
          { name: 'Scenic Viewpoint', description: 'Great spot for photos and views.' }
        ]
      };

      // Prefer authoritative POI data from Google Places if available
      let chosenList = attractionsMap.default;
      try {
        const external = await mapAgent.fetchAttractionsForDestination(destination, 12);
        if (external && external.length > 0) {
          chosenList = external;
        } else {
          // select best matching static mapping
          for (const k of Object.keys(attractionsMap)) {
            if (k === 'default') continue;
            if (key.includes(k) || k.includes(key)) {
              chosenList = attractionsMap[k];
              break;
            }
          }
        }
      } catch (e) {
        console.warn('Google Places enrichment failed, falling back to static map', e);
        for (const k of Object.keys(attractionsMap)) {
          if (k === 'default') continue;
          if (key.includes(k) || k.includes(key)) {
            chosenList = attractionsMap[k];
            break;
          }
        }
      }

      // pool index ensures different picks across days
      let poolIndex = 0;
      const used = new Set();
      const newDays = (itinerary.days || []).map((day) => {
        const places = day.places || [];
        const genericCount = places.filter(p => isGenericPlace(p?.name)).length;

        if (places.length === 0 || genericCount >= places.length) {
          // replace entire day's places with curated attractions (2-3 items)
          const take = Math.min(3, Math.max(1, places.length || 2));
          const newPlaces = [];
          for (let i = 0; i < take; i++) {
            const candidate = chosenList[poolIndex % chosenList.length];
            poolIndex++;
            if (!candidate) continue;
            if (used.has(candidate.name)) continue;
            used.add(candidate.name);
            // Preserve extra metadata when available (from Google)
            newPlaces.push({
              name: candidate.name,
              description: candidate.description || candidate.formatted_address || `Visit ${candidate.name}`,
              address: candidate.address || candidate.formatted_address || destination,
              lat: candidate.lat || candidate.geometry?.location?.lat || null,
              lng: candidate.lng || candidate.geometry?.location?.lng || null,
              photoUrl: candidate.photoUrl || null,
            });
          }
          // if still empty, fallback to original first place or a generic
          if (newPlaces.length === 0) {
            const orig = places[0];
            if (orig) newPlaces.push(orig);
            else newPlaces.push({ name: `Top sights in ${destination}`, description: `Explore the top sights in ${destination}`, address: destination });
          }
          return { ...day, places: newPlaces };
        }

        // If day already has specific places, ensure each has a short description
        const normalized = places.map((p) => ({
          name: p.name,
          description: p.description || `Visit ${p.name} — a popular spot in ${destination}`,
          address: p.address || destination,
        }));
        return { ...day, places: normalized };
      });

      return { ...itinerary, days: newDays };
    } catch (e) {
      console.warn('enrichItineraryPlaces failed', e);
      return itinerary;
    }
  };

  function isGenericPlace(name) {
    if (!name) return true;
    const n = name.toString().toLowerCase().trim();
    if (n.length < 3) return true;
    const generic = /(explore|local attractions|local attraction|local|attraction|attractions|cultural|experience|places to visit|places|sightseeing|tour|city center|city centre|city|local market|local attractions)/i;
    return generic.test(n);
  }

  // --- Day editor helpers (search, add, remove, reorder) ---
  const openDayEditor = (dayIndex) => {
    if (!plan || !plan.days) {
      showToast('Plan is not ready yet. Please wait for generation to finish.');
      return;
    }
    setEditDayIndex(dayIndex);
    setShowDayEditor(true);
    setSearchResults([]);
    setSearchQuery("");
    setSearchError("");
    // Fetch suggested places automatically so the user can pick without typing
    fetchSuggestedPlaces(payload.destination);
  };

  const fetchSuggestedPlaces = async (destination) => {
    try {
      setSuggestionsLoading(true);
      setSuggestionsError("");

      let results = [];
      if (mapAgent && mapAgent.fetchAttractionsForDestination) {
        try {
          results = await mapAgent.fetchAttractionsForDestination(destination, 20);
        } catch (e) {
          console.warn('Google Places suggestions failed', e);
          results = [];
        }
      }

      // Fallback static suggestions if Google returns nothing
      if (!results || results.length === 0) {
        const key = (destination || "").toLowerCase();
        const staticMap = {
          "skardu": [
            { name: 'Shangrila Resort (Lower Kachura)', description: 'Scenic resort with boating and lakeside views.' },
            { name: 'Upper Kachura Lake', description: 'Crystal clear lake with mountain backdrop.' },
            { name: 'Manthoka Waterfall', description: 'Picturesque waterfall and picnic spot.' },
            { name: 'Deosai National Park', description: 'High-altitude plateau with vast plains and wildlife.' },
            { name: 'Satpara Lake', description: 'Freshwater lake ideal for boating and photography.' },
            { name: 'Shigar Fort', description: 'Historic fort and cultural museum.' }
          ],
          "hunza": [
            { name: 'Baltit Fort', description: 'Ancient fort overlooking Karimabad.' },
            { name: 'Altit Fort', description: 'Historic fort with cultural displays.' },
            { name: 'Attabad Lake', description: 'Turquoise lake popular for boat rides.' },
            { name: 'Passu Cones', description: 'Iconic jagged mountain peaks, great for photos.' }
          ],
          "gilgit": [
            { name: 'Naltar Valley', description: 'Valley known for alpine forests and skiing.' },
            { name: 'Bagrot Valley', description: 'Scenic valley with terraced fields and glaciers.' },
            { name: 'Kargah Buddha', description: 'Ancient rock carving and historic site.' }
          ],
          "lahore": [
            { name: 'Badshahi Mosque', description: 'Iconic Mughal-era mosque.' },
            { name: 'Lahore Fort', description: 'Historic fort with museums and gardens.' },
            { name: 'Food Street (Gawalmandi)', description: 'Famous street for Lahori cuisine.' }
          ],
          "karachi": [
            { name: 'Quaid-e-Azam Mausoleum', description: 'Resting place of Pakistan’s founder.' },
            { name: 'Clifton Beach', description: 'Seaside promenade and sunset spot.' },
            { name: 'Empress Market', description: 'Historic market with spices and handicrafts.' }
          ],
          "islamabad": [
            { name: 'Faisal Mosque', description: 'Modern mosque with striking architecture.' },
            { name: 'Daman-e-Koh', description: 'Hilltop viewpoint overlooking the city.' },
            { name: 'Pakistan Monument', description: 'National monument with museum and views.' }
          ],
          "naran": [
            { name: 'Lake Saif-ul-Malook', description: 'Alpine lake with dramatic mountain scenery.' },
            { name: 'Babusar Pass', description: 'High mountain pass with panoramic views.' },
            { name: 'Lulusar Lake', description: 'Scenic lake along the Kaghan Valley.' }
          ],
          "default": [
            { name: 'City Centre', description: 'Central area with shops and cafes.' },
            { name: 'Local Market', description: 'Best place to experience local food and crafts.' },
            { name: 'Scenic Viewpoint', description: 'Great spot for photos and views.' }
          ]
        };

        results = staticMap[key] || staticMap.default;
      }

      // Normalize and score results to prioritize well-known tourist attractions
      const candidates = (results || []).map((r) => ({
        name: r.name,
        description: r.description || r.formatted_address || r.address || '',
        address: r.address || r.formatted_address || payload.destination,
        lat: r.lat || (r.geometry && r.geometry.location && r.geometry.location.lat) || null,
        lng: r.lng || (r.geometry && r.geometry.location && r.geometry.location.lng) || null,
        photoUrl: r.photoUrl || (r.photos && r.photos[0] && mapAgent.getGooglePlacePhotoUrl(r.photos[0].photo_reference, 400)) || null,
        place_id: r.place_id || null,
        types: r.types || [],
        rating: r.rating || null,
        user_ratings_total: r.user_ratings_total || 0,
      }));

      // Prefer tourist attractions, museums, landmarks, forts, castles, galleries
      const typeWeights = {
        tourist_attraction: 3,
        museum: 2.5,
        art_gallery: 2.5,
        historical: 2,
        monument: 2,
        fort: 2,
        castle: 2.2,
        park: 1.5,
        natural_feature: 1.5,
        point_of_interest: 1.8,
        church: 1.5,
        mosque: 1.5,
        synagogue: 1.5,
        zoo: 1.2,
        amusement_park: 1.2,
      };

      const excludePattern = /(market|shopping|mall|station|airport|bus station|train station|supermarket|city center|city centre|local market|grocery|pharmacy)/i;

      const scored = candidates.map((c) => {
        let score = 0;
        if (c.rating) score += Number(c.rating) * 2;
        if (c.user_ratings_total) score += Math.log(1 + Number(c.user_ratings_total));
        if (c.photoUrl) score += 1;
        (c.types || []).forEach((t) => { score += typeWeights[t] || 0; });
        if (excludePattern.test(c.name) || excludePattern.test(c.description)) score -= 4;
        return { ...c, score };
      });

      // Deduplicate by name (case-insensitive)
      const seen = new Set();
      const sorted = scored.sort((a, b) => b.score - a.score).filter((s) => {
        const key = (s.name || '').toLowerCase().trim();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // If results are too generic, fall back to curated top attractions for known destinations
      let top = sorted.slice(0, 30);
      if (top.length < 6) {
        const k = (destination || '').toLowerCase();
        const curated = {
          'paris': [
            { name: 'Louvre Museum', description: 'World-famous art museum housing the Mona Lisa and many masterpieces.' },
            { name: 'Musée d\'Orsay', description: 'Museum in a former railway station, known for Impressionist art.' },
            { name: 'Eiffel Tower', description: 'Iconic iron tower offering panoramic city views.' },
            { name: 'Arc de Triomphe', description: 'Historic arch honoring those who fought for France.' },
            { name: 'Notre-Dame Cathedral', description: 'Gothic cathedral with stunning architecture.' },
            { name: 'Montmartre', description: 'Charming hilltop district with artistic heritage.' },
            { name: 'Le Marais', description: 'Historic neighborhood with boutiques and museums.' }
          ],
          'london': [
            { name: 'British Museum', description: 'Vast collection of world art and artefacts.' },
            { name: 'Tower of London', description: 'Historic castle and Crown Jewels.' },
            { name: 'Buckingham Palace', description: 'Official London residence of the monarch.' },
            { name: 'British Library', description: 'National library with rich collections.' }
          ],
        };

        const extra = curated[k] || [];
        const normalizedExtra = extra.map((r) => ({
          name: r.name,
          description: r.description || '',
          address: payload.destination,
          lat: null,
          lng: null,
          photoUrl: null,
          place_id: null,
        }));

        top = [...normalizedExtra, ...top].slice(0, 30);
      }

      const final = top.map(({ score, ...rest }) => rest);

      setSuggestedPlaces(final);
      setSearchResults(final);
    } catch (e) {
      console.error('fetchSuggestedPlaces error', e);
      setSuggestionsError('Failed to load suggestions');
      setSuggestedPlaces([]);
      setSearchResults([]);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  // Ensure each day has up to 3 places (fill from suggestions if needed)
  const ensureThreePlacesPerDay = async (itinerary, destination) => {
    try {
      if (!itinerary || !Array.isArray(itinerary.days)) return itinerary;

      const seen = new Set();
      for (const d of itinerary.days) {
        for (const p of (d.places || [])) {
          if (p && p.name) seen.add((p.name || '').toLowerCase().trim());
        }
      }

      // Fetch a larger pool of attractions
      let pool = [];
      if (mapAgent && mapAgent.fetchAttractionsForDestination) {
        try {
          pool = await mapAgent.fetchAttractionsForDestination(destination, 60) || [];
        } catch (e) {
          console.warn('fetchAttractionsForDestination failed in ensureThreePlacesPerDay', e);
          pool = [];
        }
      }

      // Fallback: use suggestedPlaces if pool empty
      if (!pool || pool.length === 0) {
        pool = suggestedPlaces && suggestedPlaces.length ? suggestedPlaces : [];
      }

      // Normalize and dedupe pool
      const poolNormalized = [];
      const poolSeen = new Set();
      for (const r of (pool || [])) {
        const name = (r.name || '').toLowerCase().trim();
        if (!name || poolSeen.has(name) || seen.has(name)) continue;
        poolSeen.add(name);
        poolNormalized.push(r);
      }

      // Fill days
      const added = [];
      let poolIndex = 0;
      for (const day of itinerary.days) {
        day.places = day.places || [];
        while (day.places.length < 3 && poolIndex < poolNormalized.length) {
          const cand = poolNormalized[poolIndex++];
          if (!cand || !cand.name) continue;
          const key = (cand.name || '').toLowerCase().trim();
          if (seen.has(key)) continue;
          const newPlace = {
            name: cand.name,
            description: cand.description || cand.formatted_address || '',
            address: cand.address || cand.formatted_address || destination,
            lat: cand.lat || (cand.geometry && cand.geometry.location && cand.geometry.location.lat) || null,
            lng: cand.lng || (cand.geometry && cand.geometry.location && cand.geometry.location.lng) || null,
            photoUrl: cand.photoUrl || (cand.photos && cand.photos[0] && mapAgent.getGooglePlacePhotoUrl(cand.photos[0].photo_reference, 400)) || null,
            place_id: cand.place_id || null,
          };
          day.places.push(newPlace);
          seen.add(key);
          added.push(newPlace);
        }
      }

      // Prefetch images for newly added places
      try {
        if (added.length > 0) {
          const imgs = await imageAgent.fetchImagesForPlaces(added.map(a => ({ name: a.name, photoUrl: a.photoUrl })));
          setPlaceImages((prev) => ({ ...prev, ...imgs }));
        }
      } catch (e) {
        console.warn('prefetch images for added places failed', e);
      }

      return itinerary;
    } catch (e) {
      console.warn('ensureThreePlacesPerDay failed', e);
      return itinerary;
    }
  };

  const closeDayEditor = () => {
    setShowDayEditor(false);
    setSearchResults([]);
    setSearchQuery("");
    setSearchError("");
  };

  const handleSearchPlaces = async (q) => {
    try {
      if (!q || q.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      setSearchLoading(true);
      setSearchError("");

      const raw = await mapAgent.searchGooglePlacesText(q, 12);

      if (!raw || raw.length === 0) {
        setSearchResults([]);
        setSearchError("No results found.");
        setSearchLoading(false);
        return;
      }

      const mapped = raw.map((r) => ({
        name: r.name,
        description: r.formatted_address || r.vicinity || (r.types ? r.types.join(', ') : ''),
        address: r.formatted_address || r.vicinity || '',
        lat: r.geometry?.location?.lat || null,
        lng: r.geometry?.location?.lng || null,
        photoUrl: (r.photos && r.photos.length) ? mapAgent.getGooglePlacePhotoUrl(r.photos[0].photo_reference, 400) : null,
        place_id: r.place_id || r.id || null,
      }));

      setSearchResults(mapped);
      setSearchLoading(false);
    } catch (e) {
      console.error('Search failed', e);
      setSearchLoading(false);
      setSearchError('Search failed. Try again.');
    }
  };

  const addPlaceToDay = async (dayIdx, place) => {
    try {
      console.log('addPlaceToDay called', { dayIdx, place, planDays: plan?.days?.length });
      if (!plan) {
        showToast('Plan not ready yet.');
        return;
      }
      const pClone = JSON.parse(JSON.stringify(plan));
      // Ensure day exists
      if (!Array.isArray(pClone.days)) pClone.days = [];
      while (pClone.days.length <= dayIdx) {
        pClone.days.push({ day: pClone.days.length + 1, places: [] });
      }
      const day = pClone.days[dayIdx];
      day.places = day.places || [];

      if (day.places.length >= maxPlacesPerDay) {
        showToast(`You can only add up to ${maxPlacesPerDay} places per day.`);
        return;
      }

      const exists = day.places.some((pp) => (pp.name || '').toLowerCase() === (place.name || '').toLowerCase());
      if (exists) {
        showToast(`${place.name} is already in Day ${dayIdx + 1}.`);
        return;
      }

      const newPlace = {
        name: place.name,
        description: place.description || '',
        address: place.address || payload.destination,
        lat: place.lat || null,
        lng: place.lng || null,
        photoUrl: place.photoUrl || null,
      };

      if (!newPlace.lat || !newPlace.lng) {
        const coords = await mapAgent.getPlaceCoordinates(newPlace.name, payload.destination);
        newPlace.lat = coords?.lat || newPlace.lat;
        newPlace.lng = coords?.lng || newPlace.lng;
        newPlace.address = coords?.formattedAddress || newPlace.address;
      }

      if (!newPlace.photoUrl) {
        try {
          newPlace.photoUrl = await imageAgent.fetchPlaceImage(newPlace.name);
        } catch (e) {
          newPlace.photoUrl = null;
        }
      }

      day.places.push(newPlace);
      setPlan(pClone);

      setPlaceImages((prev) => ({ ...prev, [newPlace.name]: newPlace.photoUrl || prev[newPlace.name] }));
      showToast(`Added ${newPlace.name} to Day ${dayIdx + 1}`);
    } catch (e) {
      console.error('addPlaceToDay error', e);
      showToast('Failed to add place.');
    }
  };

  // Add a hotel to the current plan (used by HotelCarousel 'Add to Plan')
  const addHotelToPlan = async (hotel) => {
    try {
      if (!plan) {
        showToast('Plan not ready yet.');
        return;
      }
      const pClone = JSON.parse(JSON.stringify(plan));
      pClone.hotels = pClone.hotels || [];
      const exists = pClone.hotels.some(h => (h.name || '').toLowerCase() === (hotel.name || '').toLowerCase());
      if (exists) {
        showToast(`${hotel.name} is already in your hotels.`);
        return;
      }

      // Ensure hotel has imageUrl (use imageAgent to fetch if missing)
      let hotelWithImage = { ...hotel };

      // First try: if Google Maps API available, try to fetch a Google Place photo for accuracy
      try {
        if ((!hotelWithImage.imageUrl || hotelWithImage.imageUrl.includes('source.unsplash.com')) && mapAgent && mapAgent.searchGooglePlacesText) {
          const query = `${hotel.name} ${payload.destination}`;
          const results = await mapAgent.searchGooglePlacesText(query, 1);
          if (results && results.length > 0 && results[0].photos && results[0].photos.length > 0) {
            const photoRef = results[0].photos[0].photo_reference;
            const googlePhoto = mapAgent.getGooglePlacePhotoUrl(photoRef, 800);
            if (googlePhoto) {
              hotelWithImage.imageUrl = googlePhoto;
            }
          }
        }
      } catch (e) {
        // ignore google photo fetch errors and fallback to Unsplash
      }

      // Fallback: Unsplash / ImageAgent
      if (!hotelWithImage.imageUrl) {
        try {
          const imgs = await imageAgent.fetchHotelImages([hotelWithImage], payload.destination);
          if (Array.isArray(imgs) && imgs.length > 0) hotelWithImage = imgs[0];
        } catch (e) {
          console.warn('Failed to fetch hotel image for added hotel', e);
        }
      }

      pClone.hotels.push(hotelWithImage);
      setPlan(pClone);
      setPlaceImages((prev) => ({ ...prev }));
      showToast(`${hotelWithImage.name} added to your hotels`);
    } catch (e) {
      console.error('addHotelToPlan error', e);
      showToast('Failed to add hotel.');
    }
  };

  const removeHotelFromPlan = (hotelName) => {
    try {
      if (!plan || !plan.hotels) return;
      const pClone = JSON.parse(JSON.stringify(plan));
      pClone.hotels = (pClone.hotels || []).filter(h => (h.name || '').toLowerCase() !== (hotelName || '').toLowerCase());
      setPlan(pClone);
      showToast(`Removed ${hotelName} from hotels`);
    } catch (e) {
      console.error('removeHotelFromPlan error', e);
      showToast('Failed to remove hotel.');
    }
  };

  const refreshHotelImages = async () => {
    try {
      setHotelsEditorLoading(true);
      const current = plan?.hotels || [];
      const refreshed = await imageAgent.fetchHotelImages(current, payload.destination);
      const suggestionsRefreshed = await imageAgent.fetchHotelImages(hotelSuggestions || [], payload.destination);
      setPlan((p) => ({ ...p, hotels: refreshed }));
      setHotelSuggestions(suggestionsRefreshed || hotelSuggestions);
      showToast('Hotel images refreshed');
    } catch (e) {
      console.error('refreshHotelImages failed', e);
      showToast('Failed to refresh images');
    } finally {
      setHotelsEditorLoading(false);
    }
  };

  // Update a hotel's image URL in the current plan and persist to imageAgent cache
  const updateHotelImageInPlan = (hotelName, newUrl) => {
    try {
      if (!plan) return;
      const pClone = JSON.parse(JSON.stringify(plan));
      pClone.hotels = pClone.hotels || [];
      let changed = false;
      for (let i = 0; i < pClone.hotels.length; i++) {
        const h = pClone.hotels[i];
        if ((h.name || '').toLowerCase() === (hotelName || '').toLowerCase()) {
          pClone.hotels[i] = { ...h, imageUrl: newUrl };
          changed = true;
        }
      }
      if (changed) {
        setPlan(pClone);
      }

      // persist to imageAgent cache as well
      try {
        const hotelKey = `hotel:${(hotelName || '').trim()}::${payload.destination}`;
        imageAgent.hotelCache[hotelKey] = newUrl;
        if (imageAgent._persistCache) imageAgent._persistCache();
      } catch (e) {
        // ignore
      }
    } catch (e) {
      console.warn('updateHotelImageInPlan failed', e);
    }
  };

  const loadMoreHotelSuggestions = async () => {
    try {
      setHotelsEditorLoading(true);

      // Determine budget level hint
      const budgetLevel = (payload.budget || '').toLowerCase().includes('luxury') ? 'Luxury' : (payload.budget || '').toLowerCase().includes('budget') ? 'Budget' : 'Mid-range';

      // Request additional hotels from apiService
      const more = await apiService.generateHotels(payload.destination, payload.travelers, budgetLevel);
      if (!more || !Array.isArray(more) || more.length === 0) {
        showToast('No more suggestions available');
        return;
      }

      // Dedupe against existing suggestions and current plan hotels
      const existing = new Set([
        ...(hotelSuggestions || []).map(h => (h.name || '').toLowerCase()),
        ...((plan?.hotels || []).map(h => (h.name || '').toLowerCase()))
      ]);

      const unique = more.filter(h => h && h.name && !existing.has((h.name || '').toLowerCase()));
      if (unique.length === 0) {
        showToast('No new unique hotels found');
        return;
      }

      // Ensure images for these hotels
      const withImages = await imageAgent.fetchHotelImages(unique, payload.destination);

      setHotelSuggestions((prev) => ([...(prev || []), ...(withImages || [])]));
      showToast(`Loaded ${withImages.length} more hotels`);
    } catch (e) {
      console.error('loadMoreHotelSuggestions failed', e);
      showToast('Failed to load more hotels');
    } finally {
      setHotelsEditorLoading(false);
    }
  };

  const removePlaceFromDay = (dayIdx, idx) => {
    try {
      if (!plan || !plan.days || !plan.days[dayIdx]) return;
      const pClone = JSON.parse(JSON.stringify(plan));
      pClone.days[dayIdx].places = (pClone.days[dayIdx].places || []).filter((_, i) => i !== idx);
      setPlan(pClone);
      showToast(`Removed place from Day ${dayIdx + 1}`);
    } catch (e) {
      console.error(e);
      showToast('Failed to remove place.');
    }
  };

  const movePlace = (dayIdx, from, to) => {
    try {
      if (!plan || !plan.days || !plan.days[dayIdx]) return;
      const pClone = JSON.parse(JSON.stringify(plan));
      const places = pClone.days[dayIdx].places || [];
      if (from < 0 || to < 0 || from >= places.length || to >= places.length) return;
      const item = places.splice(from, 1)[0];
      places.splice(to, 0, item);
      pClone.days[dayIdx].places = places;
      setPlan(pClone);
    } catch (e) {
      console.error(e);
      showToast('Failed to reorder places.');
    }
  };

  

  const calculateDuration = () => {
    const start = new Date(payload.startDate);
    const end = new Date(payload.endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // ---------- Handlers ----------
  const handleBack = () => navigate("/planner");
  const handleRetry = () => {
    setPlan(null);
    setBudget(null);
    setPlaceImages({});
    setDestinationImage("");
    setAgentStatus({
      itinerary: "pending",
      budget: "pending",
      map: "pending",
    });
    generatePlan();
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      showToast("⏳ Saving your trip...");

      const user = auth?.currentUser;
      const userId = user?.uid || "guest-user";

      const cleanItineraryDays = (itineraryDays || []).map((day) => ({
        day: day?.day || 1,
        places: (day?.places || []).map((place) => ({
          name: place?.name || "Unknown Place",
          description: place?.description || "No description available",
          lat: place?.lat || null,
          lng: place?.lng || null,
        })),
        tips: day?.tips || "Enjoy your day!",
      }));

      const cleanHotels = (hotels || []).map((hotel) => ({
        name: hotel?.name || "Hotel",
        price: hotel?.price || "Price not available",
        rating: hotel?.rating || 4.0,
        description: hotel?.description || "Comfortable accommodation",
        imageUrl: hotel?.imageUrl || "",
        location: hotel?.location || "",
        distance: hotel?.distance || "",
        amenities: hotel?.amenities || [],
      }));

      const cleanTravelTips = (travelTips || []).filter(
        (tip) => tip && tip.trim() !== "",
      );

      // Enrich hotels with images before saving so saved docs include images
      let hotelsWithImages = cleanHotels;
      try {
        if (imageAgent && imageAgent.fetchHotelImages) {
          const enriched = await imageAgent.fetchHotelImages(cleanHotels, payload.destination);
          if (enriched && Array.isArray(enriched) && enriched.length > 0) hotelsWithImages = enriched;
        } else {
          hotelsWithImages = cleanHotels.map(h => ({ ...h, imageUrl: h.imageUrl || `https://source.unsplash.com/800x600/?hotel,${encodeURIComponent(h.name || payload.destination)}` }));
        }
      } catch (e) {
        console.warn('Failed to fetch hotel images before save', e);
        hotelsWithImages = cleanHotels.map(h => ({ ...h, imageUrl: h.imageUrl || `https://source.unsplash.com/800x600/?hotel,${encodeURIComponent(h.name || payload.destination)}` }));
      }

      const tripData = {
        userId: userId,
        destination: payload?.destination || "Unknown Destination",
        startDate: payload?.startDate || new Date().toISOString().split("T")[0],
        endDate: payload?.endDate || new Date().toISOString().split("T")[0],
        travelers: payload?.travelers || "Not specified",
        budgetLevel: payload?.budget || "Standard",
        preferences: payload?.preferences || "General travel",
        days: cleanItineraryDays,
        hotels: hotelsWithImages,
        food: plan?.food || [],
        travelTips: cleanTravelTips,
        budget: budget
          ? (() => {
              // normalize and persist top-level budget fields so saved trips retain totals & breakdown
              const daysCount = (cleanItineraryDays || []).length || calculateDuration();
              const topTotal = budget.total ?? (budget.original && budget.original.total) ?? null;
              const topDaily = budget.daily ?? (topTotal && daysCount ? Math.round(topTotal / daysCount) : null);
              const topBreakdown = budget.breakdown ?? (budget.original && budget.original.breakdown) ?? null;
              return {
                total: topTotal,
                daily: topDaily,
                breakdown: topBreakdown,
                recommendations: budget.recommendations ?? (budget.original && budget.original.recommendations) ?? [],
                currency: budget.currency ?? "USD",
                budgetLevel: payload?.budget || budget.budgetLevel || "Standard",
                original: budget.original || budget || null,
                optimized: budget.optimized || null,
                savings:
                  (budget.optimized && budget.original)
                    ? (budget.original.total - budget.optimized.total)
                    : (budget.savings ?? 0),
              };
            })()
          : null,
        savedAt: new Date().toISOString(),
        tripName: `${payload?.destination || "My Trip"} - ${formatDate(payload?.startDate || new Date())}`,
        createdAt: new Date().toISOString(),
      };

      console.log("Saving trip data:", tripData);

      const docRef = await addDoc(collection(db, "savedTrips"), tripData);
      console.log("✅ Trip saved! ID:", docRef.id);
      showToast("✅ Trip saved successfully!");

      setTimeout(() => {
        if (
          window.confirm("Trip saved! Would you like to view your saved trips?")
        ) {
          navigate("/planner?tab=saved");
        }
      }, 1500);
    } catch (error) {
      console.error("Save error:", error);
      showToast("❌ Failed to save trip: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast("🔗 Link copied to clipboard!");
  };

  const handleViewSavedTrips = () => {
    navigate("/planner?tab=saved");
  };

  // Get budget display text
  const getBudgetDisplay = () => {
    if (budget?.budgetLevel) return budget.budgetLevel;
    if (payload?.budget) return payload.budget;
    return "Standard";
  };

  // ---------- LOADING ----------
  if (loading) {
    return (
      <div className="generate-plan-container" style={{ paddingTop: "94px" }}>
        <div className="loading-screen">
          <div className="ai-loading">
            <div className="ai-brain-container">
              <div className="ai-brain">
                <div className="brain-pulse"></div>
                <div className="brain-glow"></div>
                <i className="fas fa-brain"></i>
              </div>
            </div>
            <div className="ai-loading-text">
              <h2>🤖 AI Agents At Work</h2>
              <p className="loading-subtitle">
                {agentStatus.itinerary === "working" &&
                  "📝 Itinerary Agent is planning your trip..."}
                {agentStatus.budget === "working" &&
                  "💰 Budget Agent is calculating costs..."}
                {agentStatus.map === "working" &&
                  "📍 Map Agent is locating places..."}
                {agentStatus.itinerary === "done" &&
                  agentStatus.budget === "done" &&
                  agentStatus.map === "done" &&
                  "✨ Almost ready..."}
              </p>
            </div>
            <div className="loading-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${(agentStatus.itinerary === "done" ? 33 : 0) + (agentStatus.budget === "done" ? 33 : 0) + (agentStatus.map === "done" ? 33 : 0)}%`,
                  }}
                ></div>
              </div>
              <div className="loading-steps">
                <div
                  className={`loading-step ${agentStatus.itinerary !== "pending" ? "active" : ""}`}
                >
                  <div className="step-icon">🗺️</div>
                  <span className="step-text">Itinerary Agent</span>
                  {agentStatus.itinerary === "working" && (
                    <i className="fas fa-spinner fa-spin"></i>
                  )}
                  {agentStatus.itinerary === "done" && (
                    <i
                      className="fas fa-check-circle"
                      style={{ color: "#4CAF50" }}
                    ></i>
                  )}
                </div>
                <div
                  className={`loading-step ${agentStatus.budget !== "pending" ? "active" : ""}`}
                >
                  <div className="step-icon">💰</div>
                  <span className="step-text">Budget Agent</span>
                  {agentStatus.budget === "working" && (
                    <i className="fas fa-spinner fa-spin"></i>
                  )}
                  {agentStatus.budget === "done" && (
                    <i
                      className="fas fa-check-circle"
                      style={{ color: "#4CAF50" }}
                    ></i>
                  )}
                </div>
                <div
                  className={`loading-step ${agentStatus.map !== "pending" ? "active" : ""}`}
                >
                  <div className="step-icon">📍</div>
                  <span className="step-text">Map Agent</span>
                  {agentStatus.map === "working" && (
                    <i className="fas fa-spinner fa-spin"></i>
                  )}
                  {agentStatus.map === "done" && (
                    <i
                      className="fas fa-check-circle"
                      style={{ color: "#4CAF50" }}
                    ></i>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- ERROR ----------
  if (error && !plan) {
    return (
      <div className="generate-plan-container">
        <div className="error-state">
          <div className="error-icon-container">
            <div className="error-glow"></div>
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h2 className="error-title">Oops! Something went wrong</h2>
          <p className="error-message">{error}</p>
          <div className="error-buttons">
            <button
              onClick={handleRetry}
              disabled={loading}
              className="retry-btn"
            >
              <div className="btn-icon">
                <i className="fas fa-redo"></i>
              </div>
              <span className="btn-text">Try Again</span>
            </button>
            <button onClick={handleBack} className="back-btn">
              <div className="btn-icon">
                <i className="fas fa-arrow-left"></i>
              </div>
              <span className="btn-text">Back to Planner</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- MAIN UI ----------
  return (
    <div
      className="generate-plan-container"
      style={{
        paddingTop: "74px",
        background: "linear-gradient(135deg, #0B1E33 0%, #1a2f45 100%)",
        minHeight: "100vh",
      }}
    >
      {/* Toast Notification */}
      {toast && (
        <div
          className="toast-notification"
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: "#1e3a5f",
            color: "white",
            padding: "12px 24px",
            borderRadius: "50px",
            boxShadow: "0 4px 20px rgba(0,20,40,0.3)",
            zIndex: 9999,
            animation: "slideIn 0.3s ease",
            border: "1px solid #3b5f8c",
          }}
        >
          <div
            className="toast-content"
            style={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            <i className="fas fa-check-circle" style={{ color: "#4CAF50" }}></i>
            <span>{toast}</span>
          </div>
          <div
            className="toast-progress"
            style={{
              position: "absolute",
              bottom: "0",
              left: "0",
              height: "3px",
              background: "linear-gradient(90deg, #4CAF50, #81c784)",
              animation: "progress 3s linear",
            }}
          ></div>
        </div>
      )}

      {/* HOTELS EDITOR MODAL */}
      {showHotelsEditor && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(2,6,23,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300,
            padding: '20px'
          }}
        >
          <div style={{ width: '1000px', maxWidth: '100%', background: '#071822', border: '1px solid #213e57', borderRadius: '12px', padding: '18px', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0 }}>Manage Hotels</h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button onClick={refreshHotelImages} disabled={hotelsEditorLoading} style={{ background: '#1e3a5f', border: '1px solid #3b5f8c', color: 'white', padding: '8px 12px', borderRadius: '8px' }}>{hotelsEditorLoading ? 'Refreshing...' : 'Refresh Images'}</button>
                <button onClick={() => setShowHotelsEditor(false)} style={{ background: '#1e3a5f', border: '1px solid #3b5f8c', color: 'white', padding: '8px 12px', borderRadius: '8px' }}>Close</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <h4 style={{ marginTop: 0 }}>Your Hotels ({(plan?.hotels || []).length})</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(plan?.hotels || []).map((h, i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#081826', padding: '10px', borderRadius: '8px', border: '1px solid #173347' }}>
                      <div role="img" aria-label={h.name} style={{ width: '120px', height: '84px', borderRadius: '8px', flexShrink: 0, backgroundImage: `url(${getHotelImage(h)})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#071822' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700 }}>{h.name}</div>
                        <div style={{ color: '#a3c6ff', fontSize: '13px' }}>{h.location || h.description}</div>
                        <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                          <button onClick={() => removeHotelFromPlan(h.name)} style={{ padding: '8px 10px', borderRadius: '6px', background: '#7a2430', color: 'white', border: '1px solid #5a1b25' }}>Remove</button>
                          <button onClick={() => openBookingLink(h.name)} style={{ padding: '8px 10px', borderRadius: '6px', background: '#1e3a5f', color: 'white', border: '1px solid #3b5f8c' }}>Book</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!plan?.hotels || plan.hotels.length === 0) && (<div style={{ color: '#a3c6ff' }}>No hotels in your plan yet.</div>)}
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ marginTop: 0 }}>Suggested Hotels ({(hotelSuggestions || []).length})</h4>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={loadMoreHotelSuggestions} disabled={hotelsEditorLoading} style={{ padding: '8px 12px', background: '#25435f', color: 'white', border: '1px solid #1e3a5f', borderRadius: '8px' }}>{hotelsEditorLoading ? 'Loading...' : 'Load More'}</button>
                    <button onClick={() => setHotelSuggestions([])} style={{ padding: '8px 12px', background: '#16384e', color: 'white', border: '1px solid #213e57', borderRadius: '8px' }}>Clear</button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '540px', overflowY: 'auto' }}>
                  {(hotelSuggestions || []).map((h, i) => {
                    const already = (plan?.hotels || []).some(ph => (ph.name || '').toLowerCase() === (h.name || '').toLowerCase());
                    return (
                      <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#081826', padding: '10px', borderRadius: '8px', border: '1px solid #173347' }}>
                        <div role="img" aria-label={h.name} style={{ width: '120px', height: '84px', borderRadius: '8px', flexShrink: 0, backgroundImage: `url(${getHotelImage(h)})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#071822' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700 }}>{h.name}</div>
                          <div style={{ color: '#a3c6ff', fontSize: '13px' }}>{h.location || h.description}</div>
                          <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                            <button onClick={() => openBookingLink(h.name)} style={{ padding: '8px 10px', borderRadius: '6px', background: '#1e3a5f', color: 'white', border: '1px solid #3b5f8c' }}>Book</button>
                            <button onClick={() => addHotelToPlan(h)} disabled={already} style={{ padding: '8px 10px', borderRadius: '6px', background: already ? '#475569' : '#2a4a77', color: 'white', border: '1px solid #1e3a5f' }}>{already ? 'Added' : 'Add'}</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {(!hotelSuggestions || hotelSuggestions.length === 0) && (<div style={{ color: '#a3c6ff' }}>No suggestions available.</div>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        className="floating-action-btn"
        onClick={handleSave}
        disabled={saving}
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          width: "60px",
          height: "60px",
          borderRadius: "30px",
          background: saving ? "#94a3b8" : "#1e3a5f",
          border: "2px solid #3b5f8c",
          color: "white",
          cursor: saving ? "not-allowed" : "pointer",
          boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
          transition: "all 0.3s ease",
          zIndex: 999,
        }}
        onMouseEnter={(e) => {
          if (!saving) {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.background = "#2a4a77";
          }
        }}
        onMouseLeave={(e) => {
          if (!saving) {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.background = "#1e3a5f";
          }
        }}
      >
        {saving ? (
          <i className="fas fa-spinner fa-spin"></i>
        ) : (
          <i className="fas fa-bookmark"></i>
        )}
        <span
          className="fab-tooltip"
          style={{
            position: "absolute",
            right: "70px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "#1e3a5f",
            color: "white",
            padding: "5px 10px",
            borderRadius: "5px",
            fontSize: "14px",
            whiteSpace: "nowrap",
            border: "1px solid #3b5f8c",
            display: "none",
          }}
        >
          {saving ? "Saving..." : "Save Itinerary"}
        </span>
      </button>

      {/* HEADER WITH DESTINATION IMAGE BACKGROUND */}
      <div
        className="plan-header"
        style={{
          position: "relative",
          color: "white",
          padding: "60px 20px",
          marginBottom: "20px",
          backgroundImage: destinationImage ? `url(${destinationImage})` : "linear-gradient(135deg, #0a1929 0%, #0f2740 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Dark overlay for better text readability */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(135deg, rgba(10,25,41,0.85) 0%, rgba(15,39,64,0.85) 100%)",
            zIndex: 1,
          }}
        />
        
        <div
          className="header-content-wrapper"
          style={{ maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 2 }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              flexWrap: "wrap",
              gap: "15px",
            }}
          >
            <button
              onClick={handleBack}
              className="back-to-planner"
              style={{
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "white",
                padding: "8px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.15)";
              }}
            >
              <i className="fas fa-arrow-left"></i>
              Back to Planner
            </button>

            <button
              onClick={handleViewSavedTrips}
              style={{
                background: "#1e3a5f",
                border: "2px solid #FFD700",
                color: "white",
                padding: "8px 20px",
                borderRadius: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: "bold",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#2a4a77";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#1e3a5f";
              }}
            >
              <i className="fas fa-bookmark" style={{ color: "#FFD700" }}></i>
              My Saved Trips
            </button>
          </div>

          <div className="header-main">
            <div className="destination-badge" style={{ marginBottom: "15px" }}>
              <i
                className="fas fa-map-marker-alt badge-icon"
                style={{ color: "#FFD700", marginRight: "8px" }}
              ></i>
              <span className="badge-text" style={{ color: "#FFD700" }}>
                Your Journey to
              </span>
            </div>
            <h1
              className="destination-title"
              style={{
                fontSize: "56px",
                marginBottom: "15px",
                textShadow: "2px 2px 8px rgba(0,0,0,0.5)",
                fontWeight: "bold",
              }}
            >
              {payload.destination}
            </h1>
            <div
              className="header-meta"
              style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}
            >
              <div className="meta-item">
                <i
                  className="fas fa-calendar-alt"
                  style={{ color: "#FFD700", marginRight: "8px" }}
                ></i>
                <span>
                  {formatDate(payload.startDate)} →{" "}
                  {formatDate(payload.endDate)}
                </span>
              </div>
              <div className="meta-item">
                <i
                  className="fas fa-users"
                  style={{ color: "#FFD700", marginRight: "8px" }}
                ></i>
                <span>{payload.travelers}</span>
              </div>
              <div className="meta-item">
                <i
                  className="fas fa-tag"
                  style={{ color: "#FFD700", marginRight: "8px" }}
                ></i>
                <span>{getBudgetDisplay()} Budget</span>
              </div>
            </div>
          </div>

          <div className="header-actions" style={{ marginTop: "30px" }}>
            <div
              className="action-buttons-header"
              style={{ display: "flex", gap: "15px" }}
            >
              <button
                className="action-btn-header share"
                onClick={handleShare}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "white",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                }}
              >
                <i
                  className="fas fa-share-alt"
                  style={{ marginRight: "8px" }}
                ></i>
                <span>Share</span>
              </button>
              <button
                className="action-btn-header print"
                onClick={() => window.print()}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "white",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                }}
              >
                <i className="fas fa-print" style={{ marginRight: "8px" }}></i>
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TRIP STATS */}
      <div
        className="trip-stats-container"
        style={{ maxWidth: "1400px", margin: "0 auto 30px", padding: "0 20px" }}
      >
        <div
          className="stats-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "20px",
          }}
        >
          <div
            className="stat-card"
            style={{
              background: "#0f2740",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid #2a4a77",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            }}
          >
            <div
              className="stat-icon-wrapper"
              style={{
                width: "50px",
                height: "50px",
                background: "#1e3a5f",
                borderRadius: "25px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "15px",
              }}
            >
              <i
                className="fas fa-clock"
                style={{ color: "#FFD700", fontSize: "24px" }}
              ></i>
            </div>
            <div className="stat-content">
              <h3
                className="stat-label"
                style={{ color: "#a3c6ff", marginBottom: "5px" }}
              >
                Trip Duration
              </h3>
              <p
                className="stat-value"
                style={{ color: "white", fontSize: "24px", fontWeight: "bold" }}
              >
                {calculateDuration()} Days
              </p>
            </div>
          </div>
          <div
            className="stat-card"
            style={{
              background: "#0f2740",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid #2a4a77",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            }}
          >
            <div
              className="stat-icon-wrapper"
              style={{
                width: "50px",
                height: "50px",
                background: "#1e3a5f",
                borderRadius: "25px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "15px",
              }}
            >
              <i
                className="fas fa-hiking"
                style={{ color: "#FFD700", fontSize: "24px" }}
              ></i>
            </div>
            <div className="stat-content">
              <h3
                className="stat-label"
                style={{ color: "#a3c6ff", marginBottom: "5px" }}
              >
                Activities
              </h3>
              <p
                className="stat-value"
                style={{ color: "white", fontSize: "24px", fontWeight: "bold" }}
              >
                {itineraryDays.reduce((sum, day) => sum + (day.places?.length || 0), 0)}+
              </p>
            </div>
          </div>
          <div
            className="stat-card"
            style={{
              background: "#0f2740",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid #2a4a77",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            }}
          >
            <div
              className="stat-icon-wrapper"
              style={{
                width: "50px",
                height: "50px",
                background: "#1e3a5f",
                borderRadius: "25px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "15px",
              }}
            >
              <i
                className="fas fa-bed"
                style={{ color: "#FFD700", fontSize: "24px" }}
              ></i>
            </div>
            <div className="stat-content">
              <h3
                className="stat-label"
                style={{ color: "#a3c6ff", marginBottom: "5px" }}
              >
                Hotels
              </h3>
              <p
                className="stat-value"
                style={{ color: "white", fontSize: "24px", fontWeight: "bold" }}
              >
                {hotels.length}
              </p>
            </div>
          </div>
          <div
            className="stat-card"
            style={{
              background: "#0f2740",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid #2a4a77",
              cursor: "pointer",
            }}
            onClick={() =>
              budget &&
              showToast(
                `💰 Total Budget: $${budget.total} | Daily: $${budget.daily}`,
              )
            }
          >
            <div
              className="stat-icon-wrapper"
              style={{
                width: "50px",
                height: "50px",
                background: "#1e3a5f",
                borderRadius: "25px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "15px",
              }}
            >
              <i
                className="fas fa-dollar-sign"
                style={{ color: "#FFD700", fontSize: "24px" }}
              ></i>
            </div>
            <div className="stat-content">
              <h3
                className="stat-label"
                style={{ color: "#a3c6ff", marginBottom: "5px" }}
              >
                Budget
              </h3>
              <p
                className="stat-value"
                style={{ color: "white", fontSize: "24px", fontWeight: "bold" }}
              >
                ${budget?.total?.toLocaleString() || "..."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Breakdown - Enhanced */}
      {budget && (
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto 20px",
            padding: "0 20px",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #0f2740 0%, #0a1e30 100%)",
              borderRadius: "12px",
              padding: "25px",
              border: "1px solid #2a4a77",
              boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ color: "white", marginBottom: "20px" }}>
              <i
                className="fas fa-chart-pie"
                style={{ color: "#FFD700", marginRight: "10px" }}
              ></i>
              Budget Breakdown ({getBudgetDisplay()})
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "20px",
              }}
            >
              <div style={{ background: "#1e3a5f", padding: "15px", borderRadius: "8px" }}>
                <span style={{ color: "#a3c6ff" }}>🏨 Accommodation</span>
                <div style={{ color: "#FFD700", fontWeight: "bold", fontSize: "18px" }}>
                  ${budget.breakdown?.accommodation?.toLocaleString()}
                </div>
              </div>
              <div style={{ background: "#1e3a5f", padding: "15px", borderRadius: "8px" }}>
                <span style={{ color: "#a3c6ff" }}>🍽️ Food</span>
                <div style={{ color: "#FFD700", fontWeight: "bold", fontSize: "18px" }}>
                  ${budget.breakdown?.food?.toLocaleString()}
                </div>
              </div>
              <div style={{ background: "#1e3a5f", padding: "15px", borderRadius: "8px" }}>
                <span style={{ color: "#a3c6ff" }}>🎯 Activities</span>
                <div style={{ color: "#FFD700", fontWeight: "bold", fontSize: "18px" }}>
                  ${budget.breakdown?.activities?.toLocaleString()}
                </div>
              </div>
              <div style={{ background: "#1e3a5f", padding: "15px", borderRadius: "8px" }}>
                <span style={{ color: "#a3c6ff" }}>🚗 Transport</span>
                <div style={{ color: "#FFD700", fontWeight: "bold", fontSize: "18px" }}>
                  ${budget.breakdown?.transport?.toLocaleString()}
                </div>
              </div>
              <div style={{ background: "#1e3a5f", padding: "15px", borderRadius: "8px" }}>
                <span style={{ color: "#a3c6ff" }}>✨ Miscellaneous</span>
                <div style={{ color: "#FFD700", fontWeight: "bold", fontSize: "18px" }}>
                  ${budget.breakdown?.miscellaneous?.toLocaleString()}
                </div>
              </div>
            </div>
            <div
              style={{
                marginTop: "20px",
                paddingTop: "15px",
                borderTop: "1px solid #2a4a77",
              }}
            >
              <span style={{ color: "#FFD700" }}>💡 Budget Tips:</span>
              <ul
                style={{
                  marginTop: "10px",
                  color: "#a3c6ff",
                  paddingLeft: "20px",
                }}
              >
                {(budget.recommendations || []).slice(0, 3).map((rec, idx) => (
                  <li key={idx} style={{ marginBottom: "5px" }}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div
        className="content-grid with-map"
        style={{
          display: "flex",
          gap: "30px",
          alignItems: "flex-start",
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 20px",
          flexWrap: "wrap",
        }}
      >
        {/* LEFT SIDE - ITINERARY */}
        <div className="content-left" style={{ flex: 2, minWidth: "300px" }}>
          {/* DAY NAVIGATION */}
          <div
            className="day-navigation-card"
            style={{
              background: "#0f2740",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "20px",
              border: "1px solid #2a4a77",
            }}
          >
            <div
              className="day-nav-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "20px",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <h2 style={{ color: "white" }}>
                <i
                  className="fas fa-calendar-alt"
                  style={{ color: "#FFD700", marginRight: "10px" }}
                ></i>{" "}
                Daily Itinerary
              </h2>
              <div
                className="duration-badge"
                style={{
                  background: "#1e3a5f",
                  color: "#FFD700",
                  padding: "5px 15px",
                  borderRadius: "20px",
                  border: "1px solid #3b5f8c",
                }}
              >
                {calculateDuration()} Days
              </div>
            </div>

            <div
              className="day-tabs"
              style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
            >
              {itineraryDays.map((day, idx) => (
                <button
                  key={idx}
                  className={`day-tab ${activeDay === idx ? "active" : ""}`}
                  onClick={() => setActiveDay(idx)}
                  style={{
                    flex: "1",
                    minWidth: "100px",
                    padding: "12px",
                    background: activeDay === idx ? "#1e3a5f" : "#0a1929",
                    border:
                      activeDay === idx
                        ? "2px solid #FFD700"
                        : "1px solid #2a4a77",
                    borderRadius: "8px",
                    color: "white",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                >
                  <div className="day-tab-content">
                    <div className="day-number" style={{ fontWeight: "bold" }}>
                      Day {day.day || idx + 1}
                    </div>
                    <div
                      className="day-status"
                      style={{ fontSize: "12px", marginTop: "5px" }}
                    >
                      {idx === 0 && (
                        <span style={{ color: "#4CAF50" }}>🚀 Arrival</span>
                      )}
                      {idx === itineraryDays.length - 1 && (
                        <span style={{ color: "#ff6b6b" }}>🏁 Departure</span>
                      )}
                      {idx > 0 && idx < itineraryDays.length - 1 && (
                        <span style={{ color: "#FFD700" }}>🗺️ Explore</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ACTIVITY PLACES - WITH IMAGES */}
          <div
            className="timeline-card"
            style={{
              background: "#0f2740",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid #2a4a77",
            }}
          >
            <div
              className="timeline-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "20px",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h2 style={{ color: "white", margin: 0 }}>
                    Day {itineraryDays[activeDay]?.day || activeDay + 1} – Places to
                    Visit
                  </h2>
                  <button
                    onClick={() => openDayEditor(activeDay)}
                    style={{
                      background: "#1e3a5f",
                      border: "1px solid #3b5f8c",
                      color: "white",
                      padding: "6px 10px",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <i className="fas fa-edit" style={{ marginRight: '8px' }}></i>
                    Edit Day
                  </button>
                </div>
                <div className="timeline-date" style={{ color: "#a3c6ff" }}>
                  {formatDate(
                    new Date(payload.startDate).getTime() + activeDay * 86400000,
                  )}
                </div>
              </div>

            {/* Place cards with images */}
            <div
              className="places-container"
              style={{ display: "grid", gap: "20px" }}
            >
              {(itineraryDays[activeDay]?.places || []).map((place, idx) => (
                <div
                  key={idx}
                  className="place-card"
                  style={{
                    background: "#0a1929",
                    borderRadius: "12px",
                    overflow: "hidden",
                    border: "1px solid #2a4a77",
                    display: "flex",
                    flexDirection: "row",
                    transition: "transform 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateX(5px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >
                  <div
                    className="place-image"
                    style={{
                      width: "200px",
                      height: "150px",
                      position: "relative",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={
                        placeImages[place.name] ||
                        `https://source.unsplash.com/400x300/?${encodeURIComponent(place.name)}`
                      }
                      alt={place.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = fallbackSVG;
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: "10px",
                        left: "10px",
                        background: "rgba(0,0,0,0.6)",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: "11px",
                        color: "#FFD700",
                      }}
                    >
                      📍 #{idx + 1}
                    </div>
                  </div>
                  <div
                    className="place-content"
                    style={{ padding: "15px", flex: 1 }}
                  >
                    <h3
                      className="place-name"
                      style={{ color: "white", marginBottom: "10px" }}
                    >
                      {place.name}
                    </h3>
                    <p
                      className="place-description"
                      style={{ color: "#a3c6ff", marginBottom: "15px" }}
                    >
                      {place.description || "A must-visit location in " + payload.destination}
                    </p>
                    {place.address && (
                      <p
                        className="place-address"
                        style={{
                          color: "#a3c6ff",
                          fontSize: "11px",
                          marginBottom: "10px",
                        }}
                      >
                        <i
                          className="fas fa-location-dot"
                          style={{ color: "#FFD700", marginRight: "5px" }}
                        ></i>
                        {place.address}
                      </p>
                    )}
                    <div className="place-actions">
                      <button
                        className="map-btn"
                        onClick={() => {
                          setSelectedMapActivity({
                            ...place,
                            lat: place.lat,
                            lng: place.lng,
                            destination: payload.destination,
                            selectedAt: Date.now(),
                          });

                          const dayIndex = itineraryDays.findIndex((day) =>
                            day.places?.some((p) => p.name === place.name),
                          );
                          if (dayIndex !== -1 && dayIndex !== activeDay) {
                            setActiveDay(dayIndex);
                            showToast(
                              `📅 Switched to Day ${dayIndex + 1} for ${place.name}`,
                            );
                          }
                        }}
                        style={{
                          background: "#1e3a5f",
                          border: "1px solid #3b5f8c",
                          color: "white",
                          padding: "8px 16px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#2a4a77";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#1e3a5f";
                        }}
                      >
                        <i
                          className="fas fa-map-marker-alt"
                          style={{ color: "#FFD700" }}
                        ></i>{" "}
                        View on Map
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* DAY TIPS */}
            {itineraryDays[activeDay]?.tips && (
              <div
                className="day-tips-card"
                style={{
                  marginTop: "20px",
                  padding: "15px",
                  background: "#1e3a5f",
                  borderRadius: "8px",
                  border: "1px solid #3b5f8c",
                }}
              >
                <div
                  className="tips-header"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <div className="tips-icon">
                    <i
                      className="fas fa-lightbulb"
                      style={{ color: "#FFD700" }}
                    ></i>
                  </div>
                  <h3 style={{ color: "white" }}>Travel Tips for Today</h3>
                </div>
                <p className="tips-content" style={{ color: "#a3c6ff" }}>
                  {itineraryDays[activeDay].tips}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE - MAP + SIDEBAR */}
        <div
          className="content-right"
          style={{
            flex: 1,
            minWidth: "300px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* MAP */}
          <div style={{ height: "450px", width: "100%", borderRadius: "12px", overflow: "hidden" }}>
            <TripMap
              destination={payload.destination}
              itineraryDays={itineraryDays}
              activeDay={activeDay}
              selectedActivity={selectedMapActivity}
              onActivitySelect={setSelectedMapActivity}
            />
          </div>

          {/* HOTELS SECTION */}
          {hotels && hotels.length > 0 && (
            <HotelCarousel 
              hotels={hotels} 
              destination={payload.destination}
              startDate={payload.startDate}
              endDate={payload.endDate}
              travelers={payload.travelers}
              onAddHotel={addHotelToPlan}
              selectedHotelNames={(plan?.hotels || []).map(h => h.name)}
              onEditHotels={() => setShowHotelsEditor(true)}
              onReplaceHotelImage={updateHotelImageInPlan}
            />
          )}

          {/* FOOD: Flat list of ~6 random foods */}
          <div
            className="sidebar-card food-section"
            style={{
              background: "#0f2740",
              borderRadius: "12px",
              padding: "16px",
              border: "1px solid #2a4a77",
              position: "relative",
              maxHeight: "calc(100vh - 140px)",
              overflowY: "auto",
              minHeight: '140px'
            }}
          >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ color: "white", margin: 0 }}>
                  <i className="fas fa-utensils" style={{ color: "#FFD700", marginRight: "8px" }}></i>
                  Famous Food in {payload.destination}
                </h3>
              </div>

              <div>
                {(() => {
                  // prefer plan.food if available, otherwise fallback to agent defaults or static defaults
                  let items = Array.isArray(plan?.food) && plan.food.length > 0 ? plan.food.slice(0, 6) : null;
                  if (!items || items.length === 0) {
                    let pool = [];
                    try {
                      if (foodAgent && typeof foodAgent._foodsForDestination === 'function') {
                        pool = foodAgent._foodsForDestination(payload.destination || '') || [];
                      }
                    } catch (e) {
                      pool = [];
                    }
                    if (!pool || pool.length === 0) {
                      pool = [
                        { name: 'Local Thali' },
                        { name: 'Street Kebab' },
                        { name: 'Regional Stew' },
                        { name: 'Sweet Treat' },
                        { name: 'Breakfast Special' },
                        { name: 'Local Snack' }
                      ];
                    }
                    items = pool.slice(0, 6).map((it) => ({
                      name: it.name,
                      imageUrl: it.imageUrl || `https://source.unsplash.com/400x300/?${encodeURIComponent((it.name || '') + ' ' + payload.destination + ' food')}`,
                    }));
                  }

                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                      {items.map((item, idx) => (
                        <div key={idx} style={{ background: '#081826', borderRadius: '10px', overflow: 'hidden', border: '1px solid #173347' }}>
                          <div style={{ width: '100%', height: '140px', backgroundImage: `url(${item.imageUrl || fallbackSVG})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#071822' }} />
                          <div style={{ padding: '10px', color: 'white', fontWeight: 700, fontSize: '15px' }}>{item.name}</div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
          </div>

          {/* TRAVEL TIPS */}
          {travelTips && travelTips.length > 0 && (
            <div
              className="sidebar-card tips-section"
              style={{
                background: "#0f2740",
                borderRadius: "12px",
                padding: "20px",
                border: "1px solid #2a4a77",
              }}
            >
              <div
                className="card-header"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  marginBottom: "20px",
                }}
              >
                <div
                  className="header-icon"
                  style={{
                    width: "40px",
                    height: "40px",
                    background: "#1e3a5f",
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i
                    className="fas fa-compass"
                    style={{ color: "#FFD700" }}
                  ></i>
                </div>
                <div className="header-content">
                  <h3 style={{ color: "white", marginBottom: "5px" }}>
                    Essential Tips
                  </h3>
                  <p className="card-subtitle" style={{ color: "#a3c6ff" }}>
                    For a smooth journey
                  </p>
                </div>
              </div>
              <div
                className="tips-list"
                style={{ display: "grid", gap: "12px" }}
              >
                {travelTips.slice(0, 5).map((tip, idx) => (
                  <div
                    key={idx}
                    className="tip-item"
                    style={{ display: "flex", gap: "15px", alignItems: "flex-start" }}
                  >
                    <div
                      className="tip-number"
                      style={{
                        width: "24px",
                        height: "24px",
                        background: "#1e3a5f",
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FFD700",
                        fontSize: "12px",
                        flexShrink: 0,
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div
                      className="tip-content"
                      style={{ color: "#a3c6ff", flex: 1, fontSize: "13px" }}
                    >
                      {tip}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PACKING LIST */}
          <div
            className="sidebar-card packing-section"
            style={{
              background: "#0f2740",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid #2a4a77",
            }}
          >
            <div
              className="card-header"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                marginBottom: "20px",
              }}
            >
              <div
                className="header-icon"
                style={{
                  width: "40px",
                  height: "40px",
                  background: "#1e3a5f",
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i
                  className="fas fa-suitcase-rolling"
                  style={{ color: "#FFD700" }}
                ></i>
              </div>
              <div className="header-content">
                <h3 style={{ color: "white", marginBottom: "5px" }}>
                  Packing Essentials
                </h3>
                <p className="card-subtitle" style={{ color: "#a3c6ff" }}>
                  For your adventure
                </p>
              </div>
            </div>
            <div
              className="packing-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "15px",
              }}
            >
              <div className="packing-category">
                <h4
                  className="category-title"
                  style={{ color: "#FFD700", marginBottom: "10px", fontSize: "14px" }}
                >
                  Clothing
                </h4>
                <div
                  className="category-items"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <span style={{ color: "#a3c6ff", fontSize: "13px" }}>✓ Comfortable shoes</span>
                  <span style={{ color: "#a3c6ff", fontSize: "13px" }}>✓ Weather-appropriate layers</span>
                  <span style={{ color: "#a3c6ff", fontSize: "13px" }}>✓ Jacket for evenings</span>
                </div>
              </div>
              <div className="packing-category">
                <h4
                  className="category-title"
                  style={{ color: "#FFD700", marginBottom: "10px", fontSize: "14px" }}
                >
                  Essentials
                </h4>
                <div
                  className="category-items"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <span style={{ color: "#a3c6ff", fontSize: "13px" }}>✓ Travel adapter</span>
                  <span style={{ color: "#a3c6ff", fontSize: "13px" }}>✓ Power bank</span>
                  <span style={{ color: "#a3c6ff", fontSize: "13px" }}>✓ First aid kit</span>
                </div>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div
            className="sidebar-card actions-section"
            style={{
              background: "#0f2740",
              borderRadius: "12px",
              padding: "20px",
              border: "1px solid #2a4a77",
            }}
          >
            <div
              className="card-header"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                marginBottom: "20px",
              }}
            >
              <div
                className="header-icon"
                style={{
                  width: "40px",
                  height: "40px",
                  background: "#1e3a5f",
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i className="fas fa-bolt" style={{ color: "#FFD700" }}></i>
              </div>
              <h3 style={{ color: "white" }}>Quick Actions</h3>
            </div>
            <div
              className="action-buttons-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              <button
                className="action-btn-card save"
                onClick={handleSave}
                disabled={saving}
                style={{
                  background: saving ? "#94a3b8" : "#1e3a5f",
                  border: "1px solid #3b5f8c",
                  color: "white",
                  padding: "12px",
                  borderRadius: "8px",
                  cursor: saving ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (!saving) e.currentTarget.style.background = "#2a4a77";
                }}
                onMouseLeave={(e) => {
                  if (!saving) e.currentTarget.style.background = "#1e3a5f";
                }}
              >
                {saving ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i
                    className="fas fa-bookmark"
                    style={{ color: "#FFD700" }}
                  ></i>
                )}
                <span>{saving ? "Saving..." : "Save Trip"}</span>
              </button>
              <button
                className="action-btn-card export"
                onClick={() => window.print()}
                style={{
                  background: "#1e3a5f",
                  border: "1px solid #3b5f8c",
                  color: "white",
                  padding: "12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#2a4a77";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#1e3a5f";
                }}
              >
                <i
                  className="fas fa-file-export"
                  style={{ color: "#FFD700" }}
                ></i>
                <span>Export PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI FOOTER */}
      {/* Day Editor Modal */}
      {showDayEditor && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(2,6,23,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            padding: '20px'
          }}
        >
          <div style={{ width: '1000px', maxWidth: '100%', background: '#071822', border: '1px solid #213e57', borderRadius: '12px', padding: '18px', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0 }}>Manage Day {editDayIndex + 1} Places</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={closeDayEditor} style={{ background: '#1e3a5f', border: '1px solid #3b5f8c', color: 'white', padding: '8px 12px', borderRadius: '8px' }}>Close</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <h4 style={{ marginTop: 0 }}>Current Places (max {maxPlacesPerDay})</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(plan?.days?.[editDayIndex]?.places || []).map((p, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#081826', padding: '10px', borderRadius: '8px', border: '1px solid #173347' }}>
                      <img src={placeImages[p.name] || p.photoUrl || fallbackSVG} alt={p.name} style={{ width: '84px', height: '64px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} onError={(e) => { e.currentTarget.src = fallbackSVG; }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700 }}>{p.name}</div>
                        <div style={{ color: '#a3c6ff', fontSize: '13px' }}>{p.description || p.address}</div>
                        <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                          <button onClick={() => movePlace(editDayIndex, i, i - 1)} disabled={i === 0} style={{ padding: '6px 8px', borderRadius: '6px', background: '#16384e', color: 'white', border: '1px solid #17425b' }}>↑</button>
                          <button onClick={() => movePlace(editDayIndex, i, i + 1)} disabled={i === (plan.days[editDayIndex].places.length - 1)} style={{ padding: '6px 8px', borderRadius: '6px', background: '#16384e', color: 'white', border: '1px solid #17425b' }}>↓</button>
                          <button onClick={() => removePlaceFromDay(editDayIndex, i)} style={{ padding: '6px 8px', borderRadius: '6px', background: '#7a2430', color: 'white', border: '1px solid #5a1b25' }}>Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!plan?.days?.[editDayIndex]?.places || plan.days[editDayIndex].places.length === 0) && (
                    <div style={{ color: '#a3c6ff' }}>No places yet for this day.</div>
                  )}
                </div>
              </div>
              <div>
                <h4 style={{ marginTop: 0 }}>Search & Add Places</h4>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <button onClick={() => fetchSuggestedPlaces(payload.destination)} style={{ padding: '8px 12px', background: '#1e3a5f', borderRadius: '6px', color: 'white', border: '1px solid #2f5b7d' }}>Show Suggestions</button>
                  <button onClick={() => { setSearchResults([]); setSearchQuery(''); }} style={{ padding: '8px 12px', background: '#16384e', borderRadius: '6px', color: 'white', border: '1px solid #213e57' }}>Clear</button>
                </div>
                {(searchLoading || suggestionsLoading) && (
                  <div style={{ color: '#a3c6ff' }}>{suggestionsLoading ? 'Loading suggestions...' : 'Searching...'}</div>
                )}
                {(searchError || suggestionsError) && (
                  <div style={{ color: 'salmon' }}>{searchError || suggestionsError}</div>
                )}
                <div style={{ maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {searchResults.map((r, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#081826', padding: '10px', borderRadius: '8px', border: '1px solid #173347' }}>
                      <img src={r.photoUrl || fallbackSVG} alt={r.name} style={{ width: '84px', height: '64px', objectFit: 'cover', borderRadius: '6px' }} onError={(e) => { e.currentTarget.src = fallbackSVG; }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700 }}>{r.name}</div>
                        <div style={{ color: '#a3c6ff', fontSize: '13px' }}>{r.description}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                        <select
                          value={resultDaySelection[r.place_id || r.name || idx] ?? editDayIndex}
                          onChange={(e) => setResultDaySelection((prev) => ({ ...prev, [r.place_id || r.name || idx]: Number(e.target.value) })) }
                          style={{ padding: '6px', borderRadius: '6px', background: '#071822', color: 'white', border: '1px solid #213e57' }}
                        >
                          {itineraryDays.map((d, di) => (
                            <option key={di} value={di}>Day {d.day || di + 1}</option>
                          ))}
                        </select>
                        <button onClick={() => {
                          const key = r.place_id || r.name || idx;
                          const target = (resultDaySelection[key] !== undefined) ? resultDaySelection[key] : editDayIndex;
                          addPlaceToDay(target, r);
                        }} style={{ padding: '8px 10px', background: '#2a4a77', borderRadius: '6px', color: 'white', border: '1px solid #1e3a52' }}>Add</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className="ai-footer"
        style={{
          marginTop: "40px",
          padding: "30px",
          background: "#0a1929",
          borderTop: "3px solid #2a4a77",
        }}
      >
        <div
          className="ai-footer-content"
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: "30px",
            flexWrap: "wrap",
          }}
        >
          <div className="ai-footer-icon">
            <div className="ai-glow"></div>
            <i
              className="fas fa-robot"
              style={{ fontSize: "48px", color: "#FFD700" }}
            ></i>
          </div>
          <div
            className="ai-footer-text"
            style={{ flex: 1, minWidth: "300px" }}
          >
            <h4 style={{ color: "white", marginBottom: "10px" }}>
              ✨ AI-Powered Itinerary
            </h4>
            <p style={{ color: "#a3c6ff" }}>
              This personalized journey was crafted by multiple AI agents:
              <strong style={{ color: "#FFD700" }}>
                {" "}
                Itinerary Agent
              </strong>{" "}
              planned your days,
              <strong style={{ color: "#FFD700" }}> Budget Agent</strong>{" "}
              optimized your expenses for <strong>{getBudgetDisplay()}</strong> budget,
              <strong style={{ color: "#FFD700" }}> Map Agent</strong> located
              all places, and
              <strong style={{ color: "#FFD700" }}> Image Agent</strong> found
              beautiful photos. Tailored specifically for {payload.travelers}{" "}
              interested in {payload.preferences}.
            </p>
          </div>
          <div
            className="ai-footer-actions"
            style={{ display: "flex", gap: "15px" }}
          >
            <button
              className="ai-feedback-btn"
              onClick={() => showToast("Thanks for your feedback! 👍")}
              style={{
                background: "#1e3a5f",
                border: "1px solid #3b5f8c",
                color: "white",
                padding: "12px 24px",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#2a4a77";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#1e3a5f";
              }}
            >
              <i
                className="fas fa-thumbs-up"
                style={{ marginRight: "8px", color: "#FFD700" }}
              ></i>{" "}
              Like this plan?
            </button>
            <button
              className="ai-regenerate-btn"
              onClick={handleRetry}
              style={{
                background: "#2a4a77",
                border: "1px solid #3b5f8c",
                color: "white",
                padding: "12px 24px",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#3b5f8c";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#2a4a77";
              }}
            >
              <i className="fas fa-sync-alt" style={{ marginRight: "8px" }}></i>{" "}
              Regenerate
            </button>
          </div>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        .floating-action-btn:hover .fab-tooltip {
          display: block;
        }
      `}</style>
    </div>
  );
}