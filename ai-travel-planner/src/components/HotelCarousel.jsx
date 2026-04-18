// src/components/HotelCarousel.jsx
import React, { useState, useEffect } from "react";
import { imageAgent } from "../agents";

const HotelCarousel = ({ hotels = [], destination, startDate, endDate, travelers, onAddHotel, selectedHotelNames = [], onEditHotels, onReplaceHotelImage }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [resolvedImages, setResolvedImages] = useState({});

  console.log("HotelCarousel received hotels:", hotels.length); // Debug log

  if (!hotels || hotels.length === 0) {
    console.log("No hotels to display");
    return null;
  }

  const fallbackImage = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800";
  const makePlaceholder = (name, w = 800, h = 600) => `https://via.placeholder.com/${w}x${h}/0f2740/ffffff?text=${encodeURIComponent(name)}`;
  const currentHotel = hotels[currentIndex];

  const getHotelImg = (hotel) => {
    if (!hotel) return fallbackImage;
    const candidate = hotel.imageUrl || hotel.photoUrl || hotel.image || (hotel.images && hotel.images[0]);
    console.log('HotelCarousel.getHotelImg candidate from hotel object:', candidate, 'for', hotel && hotel.name);
    if (candidate) return candidate;
    try {
      const key = `hotel:${(hotel.name || '').trim()}::${destination}`;
      if (imageAgent && imageAgent.hotelCache && imageAgent.hotelCache[key]) return imageAgent.hotelCache[key];
    } catch (e) {
      // ignore
    }
    if (imageAgent && imageAgent.localHotelImages && imageAgent.localHotelImages.length) {
      let sum = 0;
      const nm = hotel.name || '';
      for (let i = 0; i < nm.length; i++) sum += nm.charCodeAt(i);
      const selected = imageAgent.localHotelImages[sum % imageAgent.localHotelImages.length];
      console.log('HotelCarousel.getHotelImg using local fallback:', selected, 'for', hotel && hotel.name);
      return selected;
    }
    console.log('HotelCarousel.getHotelImg falling back to fallbackImage for', hotel && hotel.name);
    return fallbackImage;
  };

  // Preload and resolve images for hotels to avoid broken <img> icons.
  useEffect(() => {
    let cancelled = false;

    const loadImg = (url) => new Promise((resolve) => {
      try {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
      } catch (e) {
        resolve(false);
      }
    });

    // start with already-assigned images (from state) so we avoid collisions with pre-existing values
    const assigned = { ...resolvedImages };
    const used = new Set(Object.values(assigned).filter(Boolean));

    const resolveForHotel = async (hotel) => {
      if (!hotel || !hotel.name) return;
      const key = (hotel.name || '').toLowerCase();
      if (assigned[key]) return;

      const candidates = [];
      if (hotel.imageUrl) candidates.push(hotel.imageUrl);
      if (hotel.photoUrl) candidates.push(hotel.photoUrl);
      if (hotel.image) candidates.push(hotel.image);
      if (hotel.images && Array.isArray(hotel.images)) candidates.push(...hotel.images);
      try {
        const cacheKey = `hotel:${(hotel.name || '').trim()}::${destination}`;
        if (imageAgent && imageAgent.hotelCache && imageAgent.hotelCache[cacheKey]) candidates.push(imageAgent.hotelCache[cacheKey]);
      } catch (e) {
        // ignore
      }

      // remote source.unsplash as candidate
      candidates.push(`https://source.unsplash.com/800x600/?hotel,${encodeURIComponent(hotel.name || destination)}`);

      // local bundled images last — rotate the array deterministically per-hotel so choices differ
      if (imageAgent && imageAgent.localHotelImages && imageAgent.localHotelImages.length) {
        const arr = imageAgent.localHotelImages;
        let sum = 0;
        const nm = hotel.name || '';
        for (let i = 0; i < nm.length; i++) sum += nm.charCodeAt(i);
        const start = sum % arr.length;
        const rotated = arr.slice(start).concat(arr.slice(0, start));
        candidates.push(...rotated);
      }

      // Try candidates in order; prefer the first that loads and is not already used by another hotel.
      for (const c of candidates) {
        if (cancelled) return;
        if (!c) continue;
        try {
          const ok = await loadImg(c);
          if (!ok) continue;

          // If this image URL is already used by a previously-assigned hotel, prefer another candidate
          if (used.has(c)) {
            // continue searching for another candidate (likely another local rotated image)
            continue;
          }

          // Accept this candidate
          assigned[key] = c;
          used.add(c);
          setResolvedImages((prev) => ({ ...prev, [key]: c }));
          console.log('HotelCarousel: resolved image for', hotel.name, '->', c);
          return;
        } catch (e) {
          // try next
        }
      }

      // If we reach here, either all good candidates were duplicates or none loaded.
      // As a last resort, accept the first candidate that loads even if it's already used, otherwise fallback.
      for (const c of candidates) {
        if (cancelled) return;
        if (!c) continue;
        try {
          const ok = await loadImg(c);
          if (ok) {
            assigned[key] = c;
            used.add(c);
            setResolvedImages((prev) => ({ ...prev, [key]: c }));
            console.log('HotelCarousel: accepted duplicate fallback for', hotel.name, '->', c);
            return;
          }
        } catch (e) {
          // continue
        }
      }

      // final fallback: use first local image or the global fallbackImage
      const fallback = (imageAgent && imageAgent.localHotelImages && imageAgent.localHotelImages.length) ? imageAgent.localHotelImages[0] : fallbackImage;
      assigned[key] = fallback;
      used.add(fallback);
      setResolvedImages((prev) => ({ ...prev, [key]: fallback }));
      console.log('HotelCarousel: final fallback for', hotel.name, '->', fallback);
    };

    (async () => {
      for (const h of hotels) {
        // eslint-disable-next-line no-await-in-loop
        await resolveForHotel(h);
      }
    })();

    return () => { cancelled = true; };
  }, [hotels]);

  // Debug: log when current hotel lacks an imageUrl to help diagnose missing images
  if (currentHotel && !currentHotel.imageUrl) {
    console.log('HotelCarousel: currentHotel missing imageUrl', currentHotel);
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? hotels.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === hotels.length - 1 ? 0 : prev + 1));
  };

  const handleImgError = async (hotel, e) => {
    try {
      // prevent looping
      if (imageErrors[hotel.name]) {
        e.currentTarget.src = makePlaceholder(hotel.name);
        return;
      }
      setImageErrors((p) => ({ ...p, [hotel.name]: true }));

      // Try to fetch a curated random hotel image
      let rand = null;
      try {
        if (imageAgent && imageAgent._fetchRandomHotelImage) {
          rand = await imageAgent._fetchRandomHotelImage(destination || '');
        }
      } catch (err) {
        console.warn('random hotel image fetch failed', err);
      }

      if (rand) {
        e.currentTarget.src = rand;
        if (onReplaceHotelImage) onReplaceHotelImage(hotel.name, rand);
      } else {
        e.currentTarget.src = makePlaceholder(hotel.name);
      }
    } catch (err) {
      e.currentTarget.src = makePlaceholder(hotel.name);
    }
  };

  const openBookingLink = (hotelName) => {
    const checkin = startDate ? new Date(startDate).toISOString().split("T")[0] : "";
    const checkout = endDate ? new Date(endDate).toISOString().split("T")[0] : "";
    const adults = travelers?.includes("Solo") ? 1 :
                   travelers?.includes("Couple") ? 2 :
                   travelers?.includes("Family") ? 4 : 2;

    const url = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(
      hotelName + " " + destination
    )}&checkin=${checkin}&checkout=${checkout}&group_adults=${adults}`;
    window.open(url, "_blank");
  };

  return (
    <>
      {/* ===== HOTEL CAROUSEL ===== */}
      <div
        style={{
          background: "#0f2740",
          borderRadius: "12px",
          padding: "20px",
          border: "1px solid #2a4a77",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "10px",
        }}>
          <div>
            <h3 style={{ color: "white", margin: 0 }}>
              <i className="fas fa-bed" style={{ color: "#FFD700", marginRight: "10px" }}></i>
              Recommended Hotels
            </h3>
            <p style={{ color: "#a3c6ff", fontSize: "12px", marginTop: "5px" }}>
              {hotels.length} hotels available in {destination}
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {hotels.length > 1 && (
              <div style={{ display: "flex", gap: "8px", marginRight: "10px" }}>
                <button
                  onClick={handlePrev}
                  style={{
                    background: "#1e3a5f",
                    border: "2px solid #FFD700",
                    color: "white",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <span style={{ color: "#a3c6ff", fontSize: "13px", alignSelf: "center" }}>
                  {currentIndex + 1} / {hotels.length}
                </span>
                <button
                  onClick={handleNext}
                  style={{
                    background: "#1e3a5f",
                    border: "2px solid #FFD700",
                    color: "white",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                background: "#1e3a5f",
                border: "2px solid #FFD700",
                color: "white",
                padding: "8px 16px",
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              View All ({hotels.length})
            </button>
              {onEditHotels && (
                <button
                  onClick={() => onEditHotels()}
                  style={{
                    background: "#25435f",
                    border: "2px solid #1e3a5f",
                    color: "white",
                    padding: "8px 12px",
                    borderRadius: "20px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "600",
                    marginLeft: "6px",
                  }}
                >
                  Edit
                </button>
              )}
          </div>
        </div>

        {/* Hotel Card */}
        <div
          onClick={() => { setSelectedHotel(currentHotel); setIsDetailModalOpen(true); }}
          style={{
            cursor: "pointer",
            background: "#0a1929",
            borderRadius: "12px",
            overflow: "hidden",
            border: "2px solid #2a4a77",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-5px)";
            e.currentTarget.style.borderColor = "#FFD700";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.borderColor = "#2a4a77";
          }}
        >
          <div style={{ position: "relative", height: "220px", overflow: "hidden" }}>
            <div
              aria-label={currentHotel.name}
              role="img"
              style={{
                width: '100%',
                height: '100%',
                backgroundImage: `url(${resolvedImages[(currentHotel.name || '').toLowerCase()] || getHotelImg(currentHotel)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundColor: '#071822'
              }}
            />
            <div style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              background: "#FFD700",
              color: "#0a1929",
              padding: "6px 12px",
              borderRadius: "20px",
              fontSize: "14px",
              fontWeight: "bold",
            }}>
              ★ {currentHotel.rating || "4.5"}
            </div>
          </div>
          <div style={{ padding: "20px" }}>
            <h3 style={{ color: "white", margin: "0 0 8px 0", fontSize: "20px" }}>{currentHotel.name}</h3>
            <p style={{ color: "#FFD700", fontWeight: "bold", fontSize: "18px", margin: "0 0 8px 0" }}>
              {currentHotel.price} <span style={{ color: "#a3c6ff", fontSize: "12px" }}>per night</span>
            </p>
            <p style={{ color: "#a3c6ff", fontSize: "13px", margin: "0 0 12px 0" }}>
              <i className="fas fa-map-marker-alt" style={{ marginRight: "5px", color: "#FFD700" }}></i>
              {currentHotel.location || "City Center"} • {currentHotel.distance || "1-2 km from center"}
            </p>
            <p style={{ color: "#a3c6ff", fontSize: "14px", margin: "0 0 15px 0", lineHeight: "1.5" }}>
              {currentHotel.description || "Comfortable accommodation with excellent amenities and great location."}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
              {(currentHotel.amenities || ["Free WiFi", "Restaurant", "Parking"]).slice(0, 4).map((amenity, i) => (
                <span key={i} style={{
                  background: "#1e3a5f",
                  color: "#a3c6ff",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  fontSize: "11px",
                }}>{amenity}</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={(e) => { e.stopPropagation(); openBookingLink(currentHotel.name); }}
                style={{
                  flex: 1,
                  background: "linear-gradient(135deg, #1e3a5f 0%, #2a4a77 100%)",
                  border: "2px solid #FFD700",
                  color: "white",
                  padding: "12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <i className="fas fa-bookmark"></i>
                View on Booking.com
                <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Page Indicator Dots */}
        {hotels.length > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "20px" }}>
            {hotels.map((_, idx) => (
              <span
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                style={{
                  width: currentIndex === idx ? "30px" : "8px",
                  height: "8px",
                  borderRadius: "4px",
                  background: currentIndex === idx ? "#FFD700" : "#3b5f8c",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ===== VIEW ALL MODAL ===== */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.95)",
            zIndex: 10000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "95%",
              maxWidth: "1200px",
              background: "#0f2740",
              borderRadius: "20px",
              border: "2px solid #FFD700",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Modal Header */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px 25px",
              borderBottom: "1px solid #2a4a77",
            }}>
              <h2 style={{ color: "white", margin: 0 }}>
                <i className="fas fa-bed" style={{ color: "#FFD700", marginRight: "10px" }}></i>
                All Hotels in {destination}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: "#dc2626",
                  border: "none",
                  color: "white",
                  width: "35px",
                  height: "35px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "18px",
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content - Grid View */}
            <div style={{ padding: "25px", overflow: "auto", flex: 1 }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "20px",
              }}>
                {hotels.map((hotel, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedHotel(hotel);
                      setIsDetailModalOpen(true);
                      setIsModalOpen(false);
                    }}
                    style={{
                      background: "#0a1929",
                      borderRadius: "12px",
                      overflow: "hidden",
                      border: "2px solid #2a4a77",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-5px)";
                      e.currentTarget.style.borderColor = "#FFD700";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.borderColor = "#2a4a77";
                    }}
                  >
                    <div
                      aria-label={hotel.name}
                      role="img"
                      style={{
                        width: '100%',
                        height: '160px',
                        backgroundImage: `url(${resolvedImages[(hotel.name || '').toLowerCase()] || getHotelImg(hotel)})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: '#071822'
                      }}
                    />
                    <div style={{ padding: "12px" }}>
                      <h4 style={{ color: "white", margin: "0 0 5px 0", fontSize: "14px" }}>{hotel.name}</h4>
                      <p style={{ color: "#FFD700", fontSize: "12px", fontWeight: "bold" }}>{hotel.price}</p>
                      <p style={{ color: "#a3c6ff", fontSize: "10px" }}>{hotel.location || "City Center"}</p>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); openBookingLink(hotel.name); }}
                          style={{
                            flex: 1,
                            background: "#1e3a5f",
                            border: "1px solid #FFD700",
                            color: "white",
                            padding: "6px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "11px",
                          }}
                        >
                          Book Now
                        </button>
                        {onAddHotel && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onAddHotel(hotel); }}
                            disabled={selectedHotelNames && selectedHotelNames.includes(hotel.name)}
                            style={{
                              flex: 1,
                              background: selectedHotelNames && selectedHotelNames.includes(hotel.name) ? '#475569' : '#2a4a77',
                              border: "1px solid #1e3a5f",
                              color: "white",
                              padding: "6px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "11px",
                            }}
                          >
                            {selectedHotelNames && selectedHotelNames.includes(hotel.name) ? 'Added' : 'Add'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== DETAIL MODAL ===== */}
      {isDetailModalOpen && selectedHotel && (
        <div
          onClick={() => setIsDetailModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.95)",
            zIndex: 10001,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#0f2740",
              borderRadius: "20px",
              maxWidth: "700px",
              width: "100%",
              maxHeight: "85vh",
              overflow: "auto",
              position: "relative",
              border: "2px solid #FFD700",
            }}
          >
            <button
              onClick={() => setIsDetailModalOpen(false)}
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                background: "#dc2626",
                border: "none",
                color: "white",
                width: "35px",
                height: "35px",
                borderRadius: "50%",
                cursor: "pointer",
                zIndex: 10,
              }}
            >
              ✕
            </button>

            <div
              aria-label={selectedHotel.name}
              role="img"
              style={{
                width: '100%',
                height: '250px',
                backgroundImage: `url(${resolvedImages[(selectedHotel.name || '').toLowerCase()] || getHotelImg(selectedHotel)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundColor: '#071822'
              }}
            />

            <div style={{ padding: "25px" }}>
              <h2 style={{ color: "white", marginBottom: "10px" }}>{selectedHotel.name}</h2>
              <div style={{ display: "flex", gap: "20px", marginBottom: "15px", flexWrap: "wrap" }}>
                <span style={{ color: "#FFD700", fontSize: "18px", fontWeight: "bold" }}>★ {selectedHotel.rating || "4.5"}</span>
                <span style={{ color: "#FFD700", fontSize: "18px", fontWeight: "bold" }}>{selectedHotel.price}</span>
              </div>
              <p style={{ color: "#a3c6ff", marginBottom: "10px" }}>
                <i className="fas fa-map-marker-alt" style={{ color: "#FFD700", marginRight: "8px" }}></i>
                {selectedHotel.location || "City Center"} • {selectedHotel.distance || "1-2 km from center"}
              </p>
              <p style={{ color: "#a3c6ff", lineHeight: 1.5, marginBottom: "15px" }}>
                {selectedHotel.description || "Comfortable accommodation with excellent amenities and great location."}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
                {(selectedHotel.amenities || ["Free WiFi", "Restaurant", "Parking"]).map((amenity, i) => (
                  <span key={i} style={{
                    background: "#1e3a5f",
                    color: "#a3c6ff",
                    padding: "5px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                  }}>{amenity}</span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => openBookingLink(selectedHotel.name)}
                  style={{
                    flex: 1,
                    background: "linear-gradient(135deg, #1e3a5f 0%, #2a4a77 100%)",
                    border: "2px solid #FFD700",
                    color: "white",
                    padding: "12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                  }}
                >
                  <i className="fas fa-bookmark"></i>
                  Book Now on Booking.com
                  <i className="fas fa-arrow-right"></i>
                </button>
                {onAddHotel && (
                  <button
                    onClick={() => onAddHotel(selectedHotel)}
                    disabled={selectedHotelNames && selectedHotelNames.includes(selectedHotel.name)}
                    style={{
                      flex: 1,
                      background: selectedHotelNames && selectedHotelNames.includes(selectedHotel.name) ? '#475569' : '#2a4a77',
                      border: "2px solid #1e3a5f",
                      color: "white",
                      padding: "12px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                    }}
                  >
                    {selectedHotelNames && selectedHotelNames.includes(selectedHotel.name) ? 'Added' : 'Add to Plan'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HotelCarousel;