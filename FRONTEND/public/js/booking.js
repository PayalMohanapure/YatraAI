// booking.js — Real-time price calculator for booking card

const checkInInput  = document.getElementById("checkIn");
const checkOutInput = document.getElementById("checkOut");
const priceBreakdown = document.getElementById("priceBreakdown");
const nightsSpan    = document.getElementById("nights");
const totalPriceSpan = document.getElementById("totalPrice");

// Set minimum date to today
const today = new Date().toISOString().split("T")[0];
checkInInput.setAttribute("min", today);
checkOutInput.setAttribute("min", today);

function calculatePrice() {
  const checkIn  = new Date(checkInInput.value);
  const checkOut = new Date(checkOutInput.value);

  if (checkIn && checkOut && checkOut > checkIn) {
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const total  = nights * listingPrice;

    nightsSpan.textContent    = nights;
    totalPriceSpan.textContent = "₹" + total.toLocaleString("en-IN");
    priceBreakdown.style.display = "block";
  } else {
    priceBreakdown.style.display = "none";
  }
}

checkInInput.addEventListener("change", () => {
  checkOutInput.setAttribute("min", checkInInput.value);
  calculatePrice();
});

checkOutInput.addEventListener("change", calculatePrice);
