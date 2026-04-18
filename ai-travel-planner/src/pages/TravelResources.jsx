import React, { useState, useEffect } from "react";
import "../CSS/TravelResources.css";

// Complete travel data (your JSON)
const travelData = {
  meta: {
    title: "Gilgit Baltistan AI Travel Planner — Complete Safety & Resource Data",
    region: "Gilgit Baltistan, Pakistan",
    last_updated: "2025",
    description: "Comprehensive travel safety, food, medicine, hiking gear, pharmacy, and emergency data"
  },
  geography: {
    province: "Gilgit Baltistan",
    capital: "Gilgit",
    major_districts: [
      { name: "Gilgit", altitude_m: 1500, description: "Capital city, main transport and supply hub" },
      { name: "Skardu", altitude_m: 2228, description: "Gateway to Karakoram treks including K2 Base Camp" },
      { name: "Hunza", altitude_m: 2438, description: "Popular tourist valley, Karimabad town, Rakaposhi views" },
      { name: "Nagar", altitude_m: 2900, description: "Adjacent to Hunza, Diran and Rakaposhi trekking" },
      { name: "Ghizer", altitude_m: 2300, description: "Remote western district, Phander and Shandur lakes" },
      { name: "Astore", altitude_m: 2600, description: "Fairy Meadows, Nanga Parbat base camp access" },
      { name: "Shigar", altitude_m: 2500, description: "Deosai Plateau and Satpara Lake access" },
      { name: "Kharmang", altitude_m: 2400, description: "Indus valley, remote trekking areas" },
      { name: "Ghanche", altitude_m: 2800, description: "Hushe Valley, Masherbrum and Gondogoro La" },
      { name: "Gojal (Upper Hunza)", altitude_m: 3100, description: "Gulmit, Passu, Khunjerab Pass, China border" }
    ],
    altitude_zones: [
      { zone: "Low", range_m: "1500-2500", description: "Gilgit city, lower valleys" },
      { zone: "Mid", range_m: "2500-3500", description: "Hunza, Skardu, Fairy Meadows" },
      { zone: "High", range_m: "3500-5000", description: "Trek camps, Deosai, Khunjerab" },
      { zone: "Extreme", range_m: "5000+", description: "Mountaineering zones, K2 approaches" }
    ]
  },
  best_travel_seasons: [
    { months: "May to June", condition: "Spring opening", notes: "Blooming apricots in Hunza, cool but pleasant, roads may have early snow patches" },
    { months: "July to August", condition: "Peak summer", notes: "Warm, busy, monsoon rains in lower areas, flash flood risk on KKH, best for high altitude treks" },
    { months: "September to October", condition: "Autumn (Best overall)", notes: "Clear skies, stable weather, golden foliage, ideal for photography and trekking" },
    { months: "November to April", condition: "Winter / Off season", notes: "Heavy snow, many roads closed, only Gilgit city accessible, extreme cold above 2500m" }
  ],
  safety: {
    altitude_sickness: {
      overview: "Acute Mountain Sickness (AMS) is the primary health risk in GB. Most visitors coming from low altitude are at risk above 2500m.",
      types: [
        { type: "AMS — Acute Mountain Sickness", severity: "Mild to Moderate", altitude_risk_m: "2500+", symptoms: ["Headache (main symptom)", "Nausea or vomiting", "Dizziness or light-headedness", "Fatigue and weakness", "Loss of appetite", "Difficulty sleeping"], action: "Rest at current altitude, do not ascend, take Ibuprofen or Paracetamol, hydrate well, take Diamox if symptoms persist" },
        { type: "HACE — High Altitude Cerebral Edema", severity: "Life-threatening", altitude_risk_m: "3500+", symptoms: ["Severe persistent headache not responding to medication", "Confusion, disorientation, loss of coordination", "Stumbling walk (ataxia)", "Altered consciousness or drowsiness"], action: "EMERGENCY — Descend immediately minimum 500m, administer Dexamethasone 8mg, evacuate to hospital" },
        { type: "HAPE — High Altitude Pulmonary Edema", severity: "Life-threatening", altitude_risk_m: "3000+", symptoms: ["Breathlessness at rest", "Persistent dry cough, later pink frothy sputum", "Rapid heart rate (>100 bpm)", "Blue lips or fingernails (cyanosis)", "Extreme fatigue"], action: "EMERGENCY — Descend immediately minimum 1000m, administer Nifedipine 10mg, oxygen if available, evacuate urgently" }
      ],
      acclimatization_rules: [
        "Do not ascend more than 300-500m per day above 3000m",
        "For every 1000m gained above 3000m, take a full rest day",
        "Rest 1-2 days in Gilgit (1500m) on arrival before proceeding higher",
        "Rest 1 day in Hunza/Karimabad (2438m) before going to Khunjerab or Shimshal",
        "Rest 1-2 days in Skardu (2228m) before Deosai or Baltoro trek",
        "Climb high, sleep low — ascend during day, return lower to camp",
        "Avoid alcohol for first 48 hours at any new altitude",
        "Drink 4-5 liters of water per day",
        "Avoid sleeping pills (suppress breathing at altitude)",
        "Recognize symptoms early — do not ignore headache at altitude"
      ]
    },
    natural_hazards: [
      { hazard: "Flash floods", risk_season: "July to August (Monsoon)", affected_areas: ["KKH between Raikot Bridge and Besham", "Ghizer River valley", "Astore valley", "Lower Hunza"], precautions: ["Check NDMA Pakistan daily alerts", "Do not camp near river banks", "Cross rivers in early morning when water is lowest", "Avoid KKH sections at night during monsoon season"] },
      { hazard: "Landslides", risk_season: "Year-round, peak July-September", affected_areas: ["KKH near Raikot Bridge", "Gilgit-Chitral road", "Astore road", "Skardu-Gilgit road"], precautions: ["Drive KKH only during daylight", "Check NHMP road status before travel", "Do not stop vehicle under steep cliffs", "Watch for fresh debris on road — indicates active slide"] },
      { hazard: "Extreme cold & hypothermia", risk_season: "October to April, year-round at night above 4000m", affected_areas: ["All areas above 3500m", "Deosai Plateau", "Khunjerab Pass"], precautions: ["Layer clothing — base, mid, outer shell", "Never sleep without insulated sleeping bag at altitude", "Stay dry — wet clothing accelerates heat loss 25x", "Recognize hypothermia: shivering, confusion, slurred speech", "Carry emergency space blanket / bivy bag"] },
      { hazard: "UV radiation & sunburn", risk_season: "May to September", affected_areas: ["All open terrain above 3000m", "Deosai Plains", "Snow fields"], precautions: ["Apply sunscreen SPF 50+ every 2 hours", "Wear UV-blocking sunglasses", "Snow reflection doubles UV exposure — apply sunscreen under chin also", "Lip balm SPF 30 minimum"] }
    ],
    emergency_contacts: {
      local: [
        { service: "GB Police Emergency", number: "15", coverage: "All GB" },
        { service: "Rescue 1122", number: "1122", coverage: "Gilgit and Skardu" },
        { service: "Ambulance GB", number: "115", coverage: "Major towns" },
        { service: "Fire Brigade", number: "16", coverage: "City areas" }
      ],
      medical: [
        { name: "Aga Khan Hospital Gilgit", number: "058111-AKUH (2584)", type: "Full hospital, 24hr" },
        { name: "District HQ Hospital Gilgit", number: "05811-920055", type: "Government hospital" },
        { name: "Skardu DHQ Hospital", number: "05815-960025", type: "Government hospital" }
      ]
    }
  },
  food: {
    local_traditional_foods: [
      { name: "Chapshuro", type: "Main dish", description: "Flat bread stuffed with minced meat, onions, and spices, baked on a griddle", region: "Gilgit, Hunza", vegetarian: false },
      { name: "Harissa", type: "Main dish / breakfast", description: "Slow-cooked wheat and meat porridge, traditionally lamb, cooked overnight — very warming at altitude", region: "Gilgit Baltistan wide", vegetarian: false },
      { name: "Diram Phitti", type: "Breakfast / snack", description: "Buckwheat pancakes cooked on a stone, served with butter or mulberry syrup", region: "Hunza, Nagar", vegetarian: true },
      { name: "Mamtu", type: "Main dish", description: "Steamed dumplings filled with minced meat and onion, similar to Tibetan momos", region: "Baltistan, Skardu", vegetarian: false },
      { name: "Butter Tea (Noon Chai)", type: "Beverage", description: "Pink-coloured salty butter tea made with special pink tea leaves, salt, baking soda and yak/cow butter — essential at altitude for warmth and energy", region: "Hunza, Baltistan", vegetarian: true },
      { name: "Dried Apricots (Hunza Gold)", type: "Snack / superfood", description: "Sun-dried apricots from Hunza — naturally sweet, high in iron, beta carotene, and fibre", region: "Hunza", vegetarian: true },
      { name: "Mulberry Products", type: "Fruit / snack", description: "Fresh (June-July) or dried mulberries, mulberry juice, mulberry jam — sweet and high in antioxidants", region: "Gilgit, Hunza, Ghizer", vegetarian: true },
      { name: "Walnut Halwa", type: "Dessert / snack", description: "Walnut paste cooked with flour and butter, dense and energy-rich", region: "Hunza, Nagar", vegetarian: true }
    ],
    trek_carry_foods: [
      { item: "Dry apricots (Hunza)", weight_per_day_g: 50, calories_per_100g: 240, notes: "Buy in Karimabad market — freshest and cheapest at source" },
      { item: "Mixed nuts (walnut, almond, cashew)", weight_per_day_g: 60, calories_per_100g: 580, notes: "High fat = sustained energy at altitude, do not freeze easily" },
      { item: "Energy bars", weight_per_day_g: 60, calories_per_100g: 420, notes: "Quick glucose for steep ascents" },
      { item: "ORS sachets", weight_per_day_g: 10, quantity_per_day: 2, notes: "Critical — altitude dehydration happens fast" },
      { item: "Dark chocolate (70%+ cocoa)", weight_per_day_g: 40, calories_per_100g: 540, notes: "Altitude energy, mood booster, does not freeze solid" },
      { item: "Tsampa (roasted barley flour)", weight_per_day_g: 100, calories_per_100g: 350, notes: "Buy locally in Skardu or Hunza — traditional trek food" }
    ]
  },
  medicine_kit: {
    altitude_medicines: [
      { name: "Acetazolamide (Diamox)", dose: "125-250mg", frequency: "Twice daily", use: "Prevention and treatment of AMS", priority: 1 },
      { name: "Dexamethasone", dose: "8mg initial, then 4mg every 6 hours", use: "Emergency treatment of HACE (brain swelling)", priority: 1 },
      { name: "Nifedipine (Adalat)", dose: "10mg extended release", use: "Emergency treatment of HAPE (lung swelling)", priority: 1 },
      { name: "Ibuprofen", dose: "400mg", frequency: "Every 6-8 hours", use: "Altitude headache, anti-inflammatory", priority: 1 }
    ],
    general_medicines: [
      { name: "Paracetamol (Panadol)", dose: "500-1000mg", use: "Fever, general pain, headache", priority: 1 },
      { name: "ORS Sachets", quantity_recommended: "10-15 per week", use: "Dehydration from diarrhea, vomiting, excessive sweating", priority: 1 },
      { name: "Metronidazole (Flagyl)", dose: "400-500mg", use: "Giardia, amoebic dysentery, traveler's diarrhea", priority: 2 },
      { name: "Ciprofloxacin", dose: "500mg", use: "Bacterial gastroenteritis, traveler's diarrhea", priority: 2 },
      { name: "Loperamide (Imodium)", dose: "2mg", use: "Diarrhea control — to enable travel, not a cure", priority: 2 }
    ],
    first_aid_topical: [
      { item: "Betadine (Povidone-Iodine)", use: "Wound cleaning, preventing infection" },
      { item: "Blister plasters (Compeed)", use: "Treating and preventing hiking blisters", quantity: "10-15 per person" },
      { item: "Elastic bandage", use: "Ankle sprain support, wound dressing", quantity: "2 per person" },
      { item: "Sterile gauze pads", quantity: "10 per person", use: "Wound coverage, bleeding control" },
      { item: "Sunscreen SPF 50+", use: "UV protection — UV index 11+ at 4000m altitude" },
      { item: "Lip balm SPF 30+", use: "Prevents severely chapped and sunburned lips at altitude" }
    ]
  },
  pharmacies: {
    gilgit_city: [
      { name: "Aga Khan Health Service Pharmacy", address: "Aga Khan Hospital campus, Hospital Road, Gilgit", hours: "24 hours", type: "Hospital pharmacy", stock_level: "Full — best stocked in GB" },
      { name: "Ali Medicos", address: "Airport Road, Gilgit city", hours: "8am - 10pm", type: "Retail pharmacy", stock_level: "Good — common medicines" }
    ],
    skardu: [
      { name: "Karakoram Medical Store", address: "Main Bazaar, Skardu", hours: "8am - 10pm", type: "Retail pharmacy", stock_level: "Good — trekking medicines often available" }
    ],
    no_pharmacy_areas: [
      { area: "Shimshal village and beyond", nearest: "Karimabad Hunza (4-6hr drive)" },
      { area: "Baltoro Glacier / K2 region", nearest: "Skardu city (2 days walk + vehicle)" },
      { area: "Deosai Plateau", nearest: "Skardu city" }
    ]
  },
  hiking_gear: {
    top_hiking_destinations: [
      { name: "K2 Base Camp via Baltoro Glacier", location: "Skardu district", altitude_m: 5015, trek_days: 18, difficulty: "Strenuous", best_months: "June to August", highlights: ["Concordia junction", "K2 view", "Gasherbrum massif"], guide_required: true },
      { name: "Fairy Meadows (Nanga Parbat Base Camp)", location: "Astore district", altitude_m: 3300, trek_days: "2-4", difficulty: "Moderate", best_months: "May to October", highlights: ["Closest accessible viewpoint of Nanga Parbat", "Meadow camping"], guide_required: false },
      { name: "Rakaposhi Base Camp", location: "Nagar district", altitude_m: 3500, trek_days: "2-3", difficulty: "Moderate", best_months: "June to September", highlights: ["View of Rakaposhi", "Apple and apricot orchards"], guide_required: false },
      { name: "Deosai National Park", location: "Astore / Skardu districts", altitude_m: 4114, trek_days: "1-4", difficulty: "Easy to Moderate", best_months: "July to September", highlights: ["Second highest plateau in world", "Himalayan brown bear habitat"], guide_required: false }
    ],
    clothing_layers: [
      { layer: "Base layer", items: ["Merino wool moisture-wicking long-sleeve top", "Merino wool long johns"], notes: "Avoid cotton — 'cotton kills' at altitude" },
      { layer: "Mid layer", items: ["Fleece jacket", "Insulated down or synthetic vest"], notes: "Down is lighter but loses insulation when wet" },
      { layer: "Outer shell", items: ["Waterproof and windproof hardshell jacket", "Waterproof over-trousers"], notes: "Essential above treeline" }
    ]
  },
  connectivity_and_communication: {
    mobile_coverage: [
      { area: "Gilgit city", networks: ["Jazz", "Zong", "Telenor", "SCO"], coverage: "Good 3G/4G" },
      { area: "KKH corridor (Gilgit to Sost)", networks: ["SCO"], coverage: "Patchy 2G-3G" },
      { area: "Remote valleys", coverage: "No mobile coverage", alternative: "Satellite communicator essential" }
    ]
  },
  cultural_guidelines: [
    "Dress modestly — women should wear loose clothing covering arms and legs; headscarf recommended in villages",
    "Remove shoes before entering homes or mosques",
    "Accept hospitality — refusing chai or food offered by locals is considered impolite",
    "Ask before photographing people, especially women",
    "Do not photograph military or government installations",
    "Respect Friday prayer time — reduce noise near mosques 12-2pm",
    "No public display of affection",
    "Do not litter — 'Leave No Trace' is increasingly practiced"
  ]
};

export default function TravelResources() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  const tabs = [
    { id: "overview", name: "📍 Overview", icon: "fa-map-marker-alt" },
    { id: "safety", name: "🛡️ Safety", icon: "fa-shield-alt" },
    { id: "altitude", name: "🏔️ Altitude", icon: "fa-mountain" },
    { id: "food", name: "🍜 Food", icon: "fa-utensils" },
    { id: "medicine", name: "💊 Medicine", icon: "fa-capsules" },
    { id: "gear", name: "🎒 Hiking Gear", icon: "fa-hiking" },
    { id: "pharmacy", name: "🏥 Pharmacy", icon: "fa-hospital" },
    { id: "culture", name: "🎭 Culture", icon: "fa-hand-peace" }
  ];

  return (
    <div className="travel-resources-container">
      {/* Hero Section */}
      <div className="resources-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>
            <i className="fas fa-compass"></i> {travelData.meta.title}
          </h1>
          <p>{travelData.meta.description}</p>
          <div className="hero-badges">
            <span className="badge"><i className="fas fa-calendar-alt"></i> Updated: {travelData.meta.last_updated}</span>
            <span className="badge"><i className="fas fa-map-pin"></i> {travelData.geography.province}, {travelData.geography.country || "Pakistan"}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="resources-tabs">
        <div className="tabs-wrapper">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <i className={`fas ${tab.icon}`}></i>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Sections */}
      <div className="resources-content">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="content-section fade-in">
            <div className="info-card">
              <h2><i className="fas fa-globe-asia"></i> About {travelData.geography.province}</h2>
              <p>{travelData.meta.description}</p>
            </div>

            <div className="info-card">
              <h3><i className="fas fa-city"></i> Major Districts</h3>
              <div className="districts-grid">
                {travelData.geography.major_districts.map((district, idx) => (
                  <div key={idx} className="district-card">
                    <h4>{district.name}</h4>
                    <span className="altitude-badge">🏔️ {district.altitude_m}m</span>
                    <p>{district.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="info-card">
              <h3><i className="fas fa-chart-line"></i> Altitude Zones</h3>
              <div className="altitude-zones">
                {travelData.geography.altitude_zones.map((zone, idx) => (
                  <div key={idx} className="zone-card" style={{ borderLeftColor: idx === 0 ? "#4CAF50" : idx === 1 ? "#FFC107" : idx === 2 ? "#FF9800" : "#f44336" }}>
                    <h4>{zone.zone}</h4>
                    <span>{zone.range_m}</span>
                    <p>{zone.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="info-card">
              <h3><i className="fas fa-calendar-week"></i> Best Travel Seasons</h3>
              <div className="seasons-grid">
                {travelData.best_travel_seasons.map((season, idx) => (
                  <div key={idx} className="season-card">
                    <h4>{season.months}</h4>
                    <span className={`condition ${season.condition === "Autumn (Best overall)" ? "best" : ""}`}>{season.condition}</span>
                    <p>{season.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Safety Tab */}
        {activeTab === "safety" && (
          <div className="content-section fade-in">
            <div className="info-card emergency-card">
              <h2><i className="fas fa-phone-alt"></i> Emergency Contacts</h2>
              <div className="emergency-grid">
                <div className="emergency-group">
                  <h4>🚔 Local Emergency</h4>
                  {travelData.safety.emergency_contacts.local.map((contact, idx) => (
                    <div key={idx} className="contact-item">
                      <strong>{contact.service}</strong>: {contact.number}
                      <small>{contact.coverage}</small>
                    </div>
                  ))}
                </div>
                <div className="emergency-group">
                  <h4>🏥 Medical</h4>
                  {travelData.safety.emergency_contacts.medical.map((contact, idx) => (
                    <div key={idx} className="contact-item">
                      <strong>{contact.name}</strong>: {contact.number}
                      <small>{contact.type}</small>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="info-card">
              <h3><i className="fas fa-exclamation-triangle"></i> Natural Hazards</h3>
              {travelData.safety.natural_hazards.map((hazard, idx) => (
                <div key={idx} className="hazard-card">
                  <div className="hazard-header" onClick={() => toggleSection(`hazard-${idx}`)}>
                    <h4>{hazard.hazard}</h4>
                    <span className="risk-badge">{hazard.risk_season}</span>
                    <i className={`fas fa-chevron-${expandedSection === `hazard-${idx}` ? "up" : "down"}`}></i>
                  </div>
                  {expandedSection === `hazard-${idx}` && (
                    <div className="hazard-details">
                      <p><strong>Affected Areas:</strong> {hazard.affected_areas.join(", ")}</p>
                      <p><strong>Precautions:</strong></p>
                      <ul>
                        {hazard.precautionary_measures?.map((prec, i) => <li key={i}>{prec}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Altitude Tab */}
        {activeTab === "altitude" && (
          <div className="content-section fade-in">
            <div className="info-card warning-card">
              <h2><i className="fas fa-mountain"></i> Altitude Sickness</h2>
              <p>{travelData.safety.altitude_sickness.overview}</p>
            </div>

            {travelData.safety.altitude_sickness.types.map((type, idx) => (
              <div key={idx} className={`info-card altitude-card ${type.severity === "Life-threatening" ? "critical" : ""}`}>
                <h3>{type.type}</h3>
                <span className="severity-badge">{type.severity}</span>
                <span className="altitude-badge">Risk above {type.altitude_risk_m}m</span>
                <h4>Symptoms:</h4>
                <ul>
                  {type.symptoms.map((symptom, i) => <li key={i}>{symptom}</li>)}
                </ul>
                <h4>Action Required:</h4>
                <p className="action-text">{type.action}</p>
              </div>
            ))}

            <div className="info-card">
              <h3><i className="fas fa-ruler-combined"></i> Acclimatization Rules</h3>
              <ul className="rules-list">
                {travelData.safety.altitude_sickness.acclimatization_rules.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Food Tab */}
        {activeTab === "food" && (
          <div className="content-section fade-in">
            <div className="info-card">
              <h2><i className="fas fa-utensils"></i> Local Traditional Foods</h2>
              <div className="foods-grid">
                {travelData.food.local_traditional_foods.map((food, idx) => (
                  <div key={idx} className="food-card">
                    <h4>{food.name}</h4>
                    <span className="food-type">{food.type}</span>
                    <span className={`veg-badge ${food.vegetarian ? "veg" : "non-veg"}`}>
                      {food.vegetarian ? "🌱 Vegetarian" : "🍖 Non-Vegetarian"}
                    </span>
                    <p>{food.description}</p>
                    <small><i className="fas fa-map-marker-alt"></i> {food.region}</small>
                  </div>
                ))}
              </div>
            </div>

            <div className="info-card">
              <h3><i className="fas fa-hiking"></i> Trekking Food to Carry</h3>
              <div className="trek-food-table">
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Weight/Day</th>
                      <th>Calories/100g</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {travelData.food.trek_carry_foods.map((food, idx) => (
                      <tr key={idx}>
                        <td><strong>{food.item}</strong></td>
                        <td>{food.weight_per_day_g}g</td>
                        <td>{food.calories_per_100g || "-"}</td>
                        <td>{food.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Medicine Tab */}
        {activeTab === "medicine" && (
          <div className="content-section fade-in">
            <div className="info-card disclaimer-card">
              <p><i className="fas fa-exclamation-circle"></i> All medicine information is for reference only. Consult a qualified physician before travel.</p>
            </div>

            <div className="info-card">
              <h3><i className="fas fa-syringe"></i> Altitude Medicines (Priority 1)</h3>
              <div className="medicines-grid">
                {travelData.medicine_kit.altitude_medicines.map((med, idx) => (
                  <div key={idx} className="medicine-card priority-1">
                    <h4>{med.name}</h4>
                    <p><strong>Dose:</strong> {med.dose}</p>
                    <p><strong>Use:</strong> {med.use}</p>
                    {med.frequency && <p><strong>Frequency:</strong> {med.frequency}</p>}
                  </div>
                ))}
              </div>
            </div>

            <div className="info-card">
              <h3><i className="fas fa-tablets"></i> General Medicines</h3>
              <div className="medicines-grid">
                {travelData.medicine_kit.general_medicines.map((med, idx) => (
                  <div key={idx} className="medicine-card">
                    <h4>{med.name}</h4>
                    <p><strong>Use:</strong> {med.use}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="info-card">
              <h3><i className="fas fa-band-aid"></i> First Aid Kit Essentials</h3>
              <ul className="first-aid-list">
                {travelData.medicine_kit.first_aid_topical.map((item, idx) => (
                  <li key={idx}><strong>{item.item}:</strong> {item.use}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Gear Tab */}
        {activeTab === "gear" && (
          <div className="content-section fade-in">
            <div className="info-card">
              <h2><i className="fas fa-hiking"></i> Top Hiking Destinations</h2>
              <div className="destinations-grid">
                {travelData.hiking_gear.top_hiking_destinations.map((dest, idx) => (
                  <div key={idx} className="destination-card">
                    <h4>{dest.name}</h4>
                    <span className="difficulty-badge" data-difficulty={dest.difficulty}>{dest.difficulty}</span>
                    <p><strong>Location:</strong> {dest.location}</p>
                    <p><strong>Altitude:</strong> {dest.altitude_m}m</p>
                    <p><strong>Duration:</strong> {dest.trek_days} days</p>
                    <p><strong>Best:</strong> {dest.best_months}</p>
                    <p><strong>Guide Required:</strong> {dest.guide_required ? "✅ Yes" : "❌ No"}</p>
                    <div className="highlights">
                      <strong>Highlights:</strong>
                      <ul>
                        {dest.highlights.map((h, i) => <li key={i}>{h}</li>)}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="info-card">
              <h3><i className="fas fa-tshirt"></i> Clothing Layers</h3>
              {travelData.hiking_gear.clothing_layers.map((layer, idx) => (
                <div key={idx} className="layer-card">
                  <h4>{layer.layer}</h4>
                  <ul>
                    {layer.items.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                  <p className="layer-note">{layer.notes}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pharmacy Tab */}
        {activeTab === "pharmacy" && (
          <div className="content-section fade-in">
            <div className="info-card">
              <h2><i className="fas fa-hospital"></i> Pharmacies in Gilgit</h2>
              <div className="pharmacy-list">
                {travelData.pharmacies.gilgit_city.map((pharmacy, idx) => (
                  <div key={idx} className="pharmacy-card">
                    <h4>{pharmacy.name}</h4>
                    <p><i className="fas fa-location-dot"></i> {pharmacy.address}</p>
                    <p><i className="fas fa-clock"></i> {pharmacy.hours}</p>
                    <p><i className="fas fa-tag"></i> {pharmacy.type}</p>
                    <span className="stock-badge">{pharmacy.stock_level}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="info-card">
              <h3><i className="fas fa-store"></i> Pharmacies in Skardu</h3>
              <div className="pharmacy-list">
                {travelData.pharmacies.skardu.map((pharmacy, idx) => (
                  <div key={idx} className="pharmacy-card">
                    <h4>{pharmacy.name}</h4>
                    <p><i className="fas fa-location-dot"></i> {pharmacy.address}</p>
                    <p><i className="fas fa-clock"></i> {pharmacy.hours}</p>
                    <span className="stock-badge">{pharmacy.stock_level}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="info-card warning-card">
              <h3><i className="fas fa-skull-crosswalk"></i> Areas with NO Pharmacy</h3>
              <div className="no-pharmacy-list">
                {travelData.pharmacies.no_pharmacy_areas.map((area, idx) => (
                  <div key={idx} className="no-pharmacy-card">
                    <p><strong>{area.area}</strong></p>
                    <small>Nearest: {area.nearest}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Culture Tab */}
        {activeTab === "culture" && (
          <div className="content-section fade-in">
            <div className="info-card">
              <h2><i className="fas fa-hand-peace"></i> Cultural Guidelines</h2>
              <ul className="culture-list">
                {travelData.cultural_guidelines.map((guideline, idx) => (
                  <li key={idx}><i className="fas fa-check-circle"></i> {guideline}</li>
                ))}
              </ul>
            </div>

            <div className="info-card">
              <h3><i className="fas fa-wifi"></i> Connectivity</h3>
              <div className="connectivity-grid">
                {travelData.connectivity_and_communication.mobile_coverage.map((area, idx) => (
                  <div key={idx} className="coverage-card">
                    <h4>{area.area}</h4>
                    <p><strong>Networks:</strong> {area.networks?.join(", ") || "None"}</p>
                    <p><strong>Coverage:</strong> {area.coverage}</p>
                    {area.alternative && <p className="alert"><i className="fas fa-satellite"></i> {area.alternative}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Back to Top Button */}
      <button className="back-to-top" onClick={scrollToTop}>
        <i className="fas fa-arrow-up"></i>
      </button>
    </div>
  );
}