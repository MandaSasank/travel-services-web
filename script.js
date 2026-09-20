const packageRates = {
  Goa: 5000,
  Ooty: 4000,
  Kashmir: 12000,
  Jaipur: 7500
};

const travelRates = {
  Goa: { Bus: 1200, Train: 900, Flight: 3500 },
  Ooty: { Bus: 800, Train: 600, Flight: 0 },
  Kashmir: { Bus: 2000, Train: 1500, Flight: 5000 },
  Jaipur: { Bus: 1500, Train: 1100, Flight: 4200 }
};

const ownerEmail = "venkatasasank69@gmail.com";
const ownerPhone = "+91 7601047859";

document.addEventListener("DOMContentLoaded", () => {
  setupThemeSelector();
  setupMobileNavigation();
  highlightCurrentPage();
  addTableSearch();
  addPlacesSearch();
  setupDestinationFilters();
  setupPackageFilters();
  setupPackageTools();
  setupPackageDetails();
  setupFavourites();
  renderFavouriteSummary();
  setupDateValidation();
  setupBookingEstimator();
  setupTripChecklist();
  setupGalleryLightbox();
  setupForms();
});

function setupMobileNavigation() {
  document.querySelectorAll(".site-header").forEach((header, index) => {
    const nav = header.querySelector("nav");
    if (!nav) return;

    const menuButton = document.createElement("button");
    const navId = `site-nav-${index + 1}`;
    nav.id = nav.id || navId;
    menuButton.type = "button";
    menuButton.className = "menu-toggle";
    menuButton.setAttribute("aria-controls", nav.id);
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation menu");
    menuButton.innerHTML = "<span></span><span></span><span></span>";
    header.insertBefore(menuButton, nav);

    menuButton.addEventListener("click", () => {
      const isOpen = header.classList.toggle("nav-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        header.classList.remove("nav-open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open navigation menu");
      });
    });
  });
}

function setupThemeSelector() {
  const savedTheme = localStorage.getItem("travelTheme") || "light";
  document.body.dataset.theme = savedTheme;

  document.querySelectorAll(".site-header").forEach((header) => {
    if (header.querySelector(".theme-selector")) return;

    const wrapper = document.createElement("div");
    wrapper.className = "theme-selector";
    wrapper.innerHTML = `
      <label for="themeMode">Theme</label>
      <select id="themeMode" aria-label="Choose theme mode">
        <option value="light">Normal</option>
        <option value="dark">Dark</option>
        <option value="ocean">Ocean</option>
        <option value="sunset">Sunset</option>
      </select>
    `;
    header.appendChild(wrapper);

    const select = wrapper.querySelector("select");
    select.value = savedTheme;
    select.addEventListener("change", () => {
      document.body.dataset.theme = select.value;
      localStorage.setItem("travelTheme", select.value);
      showToast(`Theme changed to ${select.options[select.selectedIndex].text}.`);
    });
  });
}

function highlightCurrentPage() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("a[href]").forEach((link) => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active-link");
    }
  });
}

function addTableSearch() {
  document.querySelectorAll("table").forEach((table) => {
    const searchBox = document.createElement("input");
    searchBox.type = "search";
    searchBox.className = "search-box";
    searchBox.placeholder = "Search table...";
    searchBox.setAttribute("aria-label", "Search table");

    table.before(searchBox);

    searchBox.addEventListener("input", () => {
      const term = searchBox.value.toLowerCase().trim();
      table.querySelectorAll("tr").forEach((row, index) => {
        if (index === 0) return;
        row.style.display = row.textContent.toLowerCase().includes(term) ? "" : "none";
      });
    });
  });
}

function addPlacesSearch() {
  const placesList = document.querySelector(".places-list");
  if (!placesList) return;

  const searchBox = document.createElement("input");
  searchBox.type = "search";
  searchBox.className = "search-box";
  searchBox.placeholder = "Search places...";
  searchBox.setAttribute("aria-label", "Search tourist places");
  placesList.before(searchBox);

  searchBox.addEventListener("input", () => {
    const term = searchBox.value.toLowerCase().trim();
    placesList.querySelectorAll(".destination-card").forEach((item) => {
      item.style.display = item.textContent.toLowerCase().includes(term) ? "" : "none";
    });
  });
}

function setupDestinationFilters() {
  const buttons = document.querySelectorAll(".filter-button");
  const destinations = document.querySelectorAll(".destination-card");
  if (!buttons.length || !destinations.length) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.dataset.filter;
      buttons.forEach((item) => item.classList.remove("active-filter"));
      button.classList.add("active-filter");

      destinations.forEach((destination) => {
        const show = category === "all" || destination.dataset.category === category;
        destination.style.display = show ? "" : "none";
      });
    });
  });
}

function setupPackageFilters() {
  const buttons = document.querySelectorAll(".package-filter");
  const packages = document.querySelectorAll(".package-card");
  if (!buttons.length || !packages.length) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((item) => item.classList.remove("active-filter"));
      button.classList.add("active-filter");
      applyPackageFilters();
    });
  });
}

function setupPackageTools() {
  const categoryFilter = document.querySelector("#categoryFilter");
  const packageSort = document.querySelector("#packageSort");
  const packageGrid = document.querySelector(".package-grid");
  if (!packageGrid) return;

  categoryFilter?.addEventListener("change", applyPackageFilters);
  packageSort?.addEventListener("change", () => {
    const cards = [...packageGrid.querySelectorAll(".package-card")];
    const sortValue = packageSort.value;

    if (sortValue !== "default") {
      cards.sort((a, b) => {
        const first = Number(a.dataset.price);
        const second = Number(b.dataset.price);
        return sortValue === "low-high" ? first - second : second - first;
      });
      cards.forEach((card) => packageGrid.appendChild(card));
    }

    applyPackageFilters();
    showToast("Packages updated.");
  });
}

function applyPackageFilters() {
  const activeBudget = document.querySelector(".package-filter.active-filter")?.dataset.budget || "all";
  const activeCategory = document.querySelector("#categoryFilter")?.value || "all";

  document.querySelectorAll(".package-card").forEach((travelPackage) => {
    const price = Number(travelPackage.dataset.price);
    const category = travelPackage.dataset.category;
    const budgetMatch = activeBudget === "all" || price <= Number(activeBudget);
    const categoryMatch = activeCategory === "all" || category === activeCategory;
    travelPackage.style.display = budgetMatch && categoryMatch ? "" : "none";
  });
}

function setupPackageDetails() {
  const detailButtons = document.querySelectorAll(".details-button");
  if (!detailButtons.length) return;

  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="packageModalTitle">
      <button type="button" class="modal-close" aria-label="Close details">x</button>
      <h2 id="packageModalTitle"></h2>
      <p id="packageModalText"></p>
      <ul id="packageModalList"></ul>
      <a class="button" href="booking.html">Request Booking</a>
    </div>
  `;
  document.body.appendChild(modal);

  const title = modal.querySelector("#packageModalTitle");
  const text = modal.querySelector("#packageModalText");
  const list = modal.querySelector("#packageModalList");
  const close = modal.querySelector(".modal-close");

  detailButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".package-card");
      const packageTitle = card.querySelector("h3").textContent;
      const price = Number(card.dataset.price).toLocaleString("en-IN");
      const days = card.dataset.days;
      const inclusions = card.dataset.inclusions.split(",");

      title.textContent = packageTitle;
      text.textContent = `${days} day package starting at ₹${price}.`;
      list.innerHTML = inclusions.map((item) => `<li>${item.trim()}</li>`).join("");
      modal.classList.add("show");
    });
  });

  close.addEventListener("click", () => modal.classList.remove("show"));
  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.classList.remove("show");
  });
}

function setupFavourites() {
  const favouriteCards = document.querySelectorAll(".destination-card, .package-card");
  if (!favouriteCards.length) return;

  const favourites = getFavourites();
  const favouriteIds = favourites.map((item) => item.id);

  favouriteCards.forEach((card) => {
    const title = card.querySelector("h3")?.textContent.trim();
    if (!title) return;

    const type = card.classList.contains("package-card") ? "package" : "destination";
    const id = `${type}:${title.toLowerCase().replace(/\s+/g, "-")}`;
    const description = card.querySelector("p")?.textContent.trim() || "";
    card.dataset.favouriteId = id;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "favourite-button";
    button.dataset.favouriteId = id;
    button.setAttribute("aria-label", `Add ${title} to favourites`);
    card.appendChild(button);

    updateFavouriteButton(button, favouriteIds.includes(id), title);

    button.addEventListener("click", () => {
      const updatedFavourites = getFavourites();
      const isFavourite = updatedFavourites.some((item) => item.id === id);
      const nextFavourites = isFavourite
        ? updatedFavourites.filter((item) => item.id !== id)
        : [...updatedFavourites, { id, title, type, description }];

      localStorage.setItem("travelFavourites", JSON.stringify(nextFavourites));
      updateFavouriteButton(button, !isFavourite, title);
      renderFavouriteSummary();
      showToast(isFavourite ? `${title} removed from favourites.` : `${title} added to favourites.`);
    });
  });
}

function getFavourites() {
  try {
    const saved = JSON.parse(localStorage.getItem("travelFavourites")) || [];
    return saved.map((item) => {
      if (typeof item === "string") {
        const [type, slug] = item.split(":");
        const title = slug.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
        return { id: item, title, type, description: "" };
      }
      return item;
    });
  } catch {
    return [];
  }
}

function updateFavouriteButton(button, isFavourite, title) {
  button.classList.toggle("is-favourite", isFavourite);
  button.textContent = isFavourite ? "★ Favourite" : "☆ Favourite";
  button.setAttribute(
    "aria-label",
    isFavourite ? `Remove ${title} from favourites` : `Add ${title} to favourites`
  );
}

function renderFavouriteSummary() {
  const container = document.querySelector("#favouritesList");
  if (!container) return;

  const favourites = getFavourites();
  if (!favourites.length) {
    container.innerHTML = "<p>No favourites added yet.</p>";
    return;
  }

  container.innerHTML = favourites.map((item) => `
    <article>
      <h3>${item.title}</h3>
      <p>${item.description || "Saved item from your travel list."}</p>
      <span>${item.type}</span>
    </article>
  `).join("");
}

function setupDateValidation() {
  const startDate = document.querySelector("#startDate");
  const endDate = document.querySelector("#endDate");
  const days = document.querySelector("#days");
  if (!startDate || !endDate || !days) return;

  const today = new Date().toISOString().split("T")[0];
  startDate.min = today;
  endDate.min = today;

  startDate.addEventListener("change", () => {
    endDate.min = startDate.value || today;
    if (endDate.value && startDate.value && endDate.value < startDate.value) {
      endDate.value = startDate.value;
    }
    syncDaysFromDates();
  });

  endDate.addEventListener("change", syncDaysFromDates);

  function syncDaysFromDates() {
    startDate.setCustomValidity("");
    endDate.setCustomValidity("");

    if (startDate.value && startDate.value < today) {
      startDate.setCustomValidity("Start date cannot be in the past.");
    }

    if (endDate.value && endDate.value < today) {
      endDate.setCustomValidity("End date cannot be in the past.");
    }

    if (startDate.value && endDate.value && endDate.value < startDate.value) {
      endDate.setCustomValidity("End date cannot be before the start date.");
      return;
    }

    if (startDate.value && endDate.value) {
      const start = new Date(startDate.value);
      const end = new Date(endDate.value);
      const dayCount = Math.round((end - start) / 86400000) + 1;
      days.value = Math.max(dayCount, 1);
      days.dispatchEvent(new Event("input"));
    }
  }
}

function setupBookingEstimator() {
  const destination = document.querySelector("#destination");
  const mode = document.querySelector("#travelMode");
  const travelers = document.querySelector("#travelers");
  const days = document.querySelector("#days");
  const total = document.querySelector("#estimateTotal");
  const details = document.querySelector("#estimateDetails");

  if (!destination || !mode || !travelers || !days || !total || !details) return;

  window.updateBookingEstimate = updateEstimate;

  [destination, mode, travelers, days].forEach((field) => {
    field.addEventListener("input", updateEstimate);
    field.addEventListener("change", updateEstimate);
  });

  updateEstimate();

  function updateEstimate() {
    const selectedDestination = destination.value;
    const selectedMode = mode.value;
    const travelerCount = Math.max(Number(travelers.value) || 1, 1);
    const dayCount = Math.max(Number(days.value) || 1, 1);
    const packageCost = packageRates[selectedDestination] || 0;
    const travelCost = travelRates[selectedDestination]?.[selectedMode] || 0;

    if (travelCost === 0) {
      total.textContent = "Not Available";
      details.textContent = `${selectedMode} is not available for ${selectedDestination}. Please choose another travel mode.`;
      return;
    }

    const stayCost = Math.max(dayCount - 1, 0) * 700;
    const estimatedTotal = (packageCost + travelCost + stayCost) * travelerCount;
    total.textContent = `₹${estimatedTotal.toLocaleString("en-IN")}`;
    details.textContent = `${selectedDestination} by ${selectedMode} for ${travelerCount} traveler(s), ${dayCount} day(s).`;
  }
}

function setupTripChecklist() {
  const checklistItems = document.querySelectorAll("[data-checklist-item]");
  if (!checklistItems.length) return;

  const savedChecklist = JSON.parse(localStorage.getItem("travelChecklist") || "{}");
  checklistItems.forEach((item) => {
    item.checked = Boolean(savedChecklist[item.dataset.checklistItem]);
    item.addEventListener("change", () => {
      const currentChecklist = JSON.parse(localStorage.getItem("travelChecklist") || "{}");
      currentChecklist[item.dataset.checklistItem] = item.checked;
      localStorage.setItem("travelChecklist", JSON.stringify(currentChecklist));
      showToast("Trip checklist updated.");
    });
  });
}

function showBookingSummary(form, onConfirm) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay show";
  modal.innerHTML = `
    <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="bookingSummaryTitle">
      <h2 id="bookingSummaryTitle">Confirm Booking Request</h2>
      <div class="booking-summary"></div>
      <div class="modal-actions">
        <button type="button" class="button confirm-booking">Confirm Request</button>
        <button type="button" class="button secondary cancel-booking">Edit Details</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const summary = modal.querySelector(".booking-summary");
  summary.innerHTML = `
    <p><strong>Name:</strong> ${form.querySelector("#customerName").value}</p>
    <p><strong>Email:</strong> ${form.querySelector("#customerEmail").value}</p>
    <p><strong>Phone:</strong> ${form.querySelector("#customerPhone").value}</p>
    <p><strong>Destination:</strong> ${form.querySelector("#destination").value}</p>
    <p><strong>Travel Mode:</strong> ${form.querySelector("#travelMode").value}</p>
    <p><strong>Dates:</strong> ${form.querySelector("#startDate").value} to ${form.querySelector("#endDate").value}</p>
    <p><strong>Travelers:</strong> ${form.querySelector("#travelers").value}</p>
    <p><strong>Total:</strong> ${document.querySelector("#estimateTotal")?.textContent || "Not calculated"}</p>
  `;

  modal.querySelector(".confirm-booking").addEventListener("click", () => {
    modal.remove();
    onConfirm();
  });
  modal.querySelector(".cancel-booking").addEventListener("click", () => modal.remove());
}

function openContactMail(form) {
  const name = form.querySelector("#enquiryName")?.value || "";
  const email = form.querySelector("#enquiryEmail")?.value || "";
  const place = form.querySelector("#placeInterested")?.value || "";
  const message = form.querySelector("#message")?.value || "";
  const subject = encodeURIComponent(`Travel enquiry for ${place}`);
  const body = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\nPhone: ${ownerPhone}\nPlace Interested: ${place}\n\nMessage:\n${message}`
  );
  window.location.href = `mailto:${ownerEmail}?subject=${subject}&body=${body}`;
}

function finishFormSubmit(form, message) {
  if (form.classList.contains("contact-form")) {
    openContactMail(form);
    message.textContent = "Your email app is opening with the enquiry addressed to venkatasasank69@gmail.com. Please send it from there.";
  } else {
    message.textContent = form.dataset.success || "Thank you! Your details were submitted successfully.";
  }

  message.className = "form-message success";
  form.reset();
  if (typeof window.updateBookingEstimate === "function") {
    window.updateBookingEstimate();
  }
  showToast("Form completed successfully.");
}

function showToast(message) {
  let toast = document.querySelector(".toast-message");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast-message";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

function setupGalleryLightbox() {
  const galleryImages = document.querySelectorAll(".gallery-image");
  if (!galleryImages.length) return;

  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.innerHTML = `
    <button class="lightbox-close" type="button" aria-label="Close image">x</button>
    <img src="" alt="Selected travel image">
  `;
  document.body.appendChild(lightbox);

  const lightboxImage = lightbox.querySelector("img");
  const closeButton = lightbox.querySelector("button");

  galleryImages.forEach((image) => {
    image.tabIndex = 0;
    image.addEventListener("click", () => openLightbox(image));
    image.addEventListener("keydown", (event) => {
      if (event.key === "Enter") openLightbox(image);
    });
  });

  closeButton.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeLightbox();
  });

  function openLightbox(image) {
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt || "Selected travel image";
    lightbox.classList.add("show");
  }

  function closeLightbox() {
    lightbox.classList.remove("show");
  }
}

function setupForms() {
  document.querySelectorAll("form").forEach((form) => {
    const message = document.createElement("p");
    message.className = "form-message";
    form.appendChild(message);

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const invalidField = [...form.querySelectorAll("input, textarea, select")].find((field) => {
        return field.hasAttribute("required") && !field.value.trim();
      });

      if (invalidField) {
        message.textContent = "Please fill all required fields.";
        message.className = "form-message error";
        invalidField.focus();
        return;
      }

      const email = form.querySelector('input[type="email"]');
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        message.textContent = "Please enter a valid email address.";
        message.className = "form-message error";
        email.focus();
        return;
      }

      const phone = form.querySelector('input[type="tel"]');
      if (phone && !/^[0-9]{10}$/.test(phone.value.trim())) {
        message.textContent = "Please enter a valid 10 digit phone number.";
        message.className = "form-message error";
        phone.focus();
        return;
      }

      if (!form.checkValidity()) {
        message.textContent = "Please check all form fields and travel dates.";
        message.className = "form-message error";
        form.reportValidity();
        return;
      }

      if (form.classList.contains("booking-form")) {
        showBookingSummary(form, () => finishFormSubmit(form, message));
        return;
      }

      finishFormSubmit(form, message);
    });
  });
}
