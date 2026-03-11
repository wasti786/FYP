// const BASE = "http://localhost:5000/api";

// /* ------------------ Chat with AI ------------------ */
// export const askBot = async (msg) => {
//   try {
//     const response = await fetch(`${BASE}/chat`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ message: msg }) // frontend sends "message"
//     });
//     return await response.json();
//   } catch (err) {
//     console.error("Error in askBot:", err);
//     return { error: "Failed to reach backend" };
//   }
// };

// /* ------------------ Budget Split ------------------ */
// export const getBudgetSplit = async (data) => {
//   try {
//     const response = await fetch(`${BASE}/budget`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(data)
//     });
//     return await response.json();
//   } catch (err) {
//     console.error("Error in getBudgetSplit:", err);
//     return { error: "Failed to reach backend" };
//   }
// };

// /* ------------------ Itinerary ------------------ */
// export const getItinerary = async (data) => {
//   try {
//     const response = await fetch(`${BASE}/itinerary`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(data)
//     });
//     return await response.json();
//   } catch (err) {
//     console.error("Error in getItinerary:", err);
//     return { error: "Failed to reach backend" };
//   }
// };
// const BASE = "http://localhost:5000/api";

// export async function askBot(message) {
//   const res = await fetch(`${BASE}/chat`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ message }),
//   });
//   return await res.json();
// }
const BASE = "http://localhost:5000/api";

export async function askBot(message) {
  const res = await fetch(`${BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  return await res.json();
}

export async function generatePlan(data) {
  const res = await fetch(`${BASE}/generate-plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to generate plan");
  }

  return await res.json();
}

