import React, { useEffect, useRef, useState } from "react";

function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getItemsPerSlideForWidth(w) {
  if (w >= 1024) return 3;
  if (w >= 768) return 2;
  return 1;
}

export default function TestimonialsCarousel({ feedbacks = [] }) {
  const [index, setIndex] = useState(0);
  const [itemsPerSlide, setItemsPerSlide] = useState(() =>
    typeof window !== "undefined" ? getItemsPerSlideForWidth(window.innerWidth) : 3
  );
  const intervalRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const cols = getItemsPerSlideForWidth(window.innerWidth);
      setItemsPerSlide(cols);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Build slides (groups) of feedbacks
  const slides = [];
  for (let i = 0; i < feedbacks.length; i += itemsPerSlide) {
    slides.push(feedbacks.slice(i, i + itemsPerSlide));
  }
  const slidesLen = Math.max(1, slides.length);

  useEffect(() => {
    // ensure current index remains valid when slides change
    setIndex((i) => Math.min(i, slidesLen - 1));
  }, [itemsPerSlide, feedbacks.length, slidesLen]);

  useEffect(() => {
    if (slidesLen <= 1) return;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % slidesLen);
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [slidesLen]);

  const prev = () => {
    clearInterval(intervalRef.current);
    setIndex((i) => (i - 1 + slidesLen) % slidesLen);
  };

  const next = () => {
    clearInterval(intervalRef.current);
    setIndex((i) => (i + 1) % slidesLen);
  };

  if (!feedbacks || feedbacks.length === 0) return null;

  return (
    <div className="testimonials-carousel" style={{ ["--cols"]: itemsPerSlide }}>
      <div className="carousel-viewport">
        <div
          className="carousel-track"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((group, slideIdx) => (
            <div className="testimonial-slide" key={slideIdx}>
              <div className="slide-grid" style={{ ["--cols"]: itemsPerSlide }}>
                {group.map((f) => (
                  <div className="testimonial-card slide-card" key={f.id}>
                    <div className="testimonial-author-top">
                      <div className="author-avatar">{getInitials(f.name)}</div>
                      <div className="author-info">
                        <h4>{f.name || "Anonymous"}</h4>
                        {((f.location && f.location.trim()) || (f.role && f.role.trim())) && (
                          <div className="author-location">{f.location || f.role}</div>
                        )}
                        {f.country && <div className="author-country">{f.country}</div>}
                      </div>
                    </div>

                    <div className="rating-display">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <span key={idx} className={`star ${idx < (Number(f.rating) || 0) ? 'filled' : ''}`}>
                          &#9733;
                        </span>
                      ))}
                    </div>

                    <div className="testimonial-content">
                      <p>{f.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {slidesLen > 1 && (
        <>
          <button className="carousel-prev" aria-label="Previous" onClick={prev}>
            ‹
          </button>
          <button className="carousel-next" aria-label="Next" onClick={next}>
            ›
          </button>
          <div className="carousel-dots">
            {Array.from({ length: slidesLen }).map((_, idx) => (
              <button
                key={idx}
                className={`dot ${idx === index ? "active" : ""}`}
                onClick={() => {
                  clearInterval(intervalRef.current);
                  setIndex(idx);
                }}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
