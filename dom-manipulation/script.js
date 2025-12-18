// ====== Server simulation ======
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // mock server

// ====== Initial Quotes ======
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { id: 1, text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { id: 2, text: "Your time is limited, so don’t waste it living someone else’s life.", category: "Life" },
  { id: 3, text: "Not how long, but how well you have lived is the main thing.", category: "Philosophy" }
];

// ====== Save to localStorage ======
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// ====== Populate Category Dropdown ======
function populateCategoryDropdown() {
  const select = document.getElementById("categorySelect");
  select.innerHTML = '<option value="All">All</option>';

  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  });

  const lastCategory = localStorage.getItem("selectedCategory") || "All";
  select.value = lastCategory;
}

// ====== Filter & Show Random Quote ======
function filterQuote() {
  const select = document.getElementById("categorySelect");
  const selectedCategory = select.value;
  localStorage.setItem("selectedCategory", selectedCategory);

  let filteredQuotes = quotes;
  if (selectedCategory !== "All") {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }

  if (filteredQuotes.length === 0) {
    document.getElementById("quoteDisplay").textContent = "No quotes available for this category!";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];
  document.getElementById("quoteDisplay").textContent = `"${randomQuote.text}" — (${randomQuote.category})`;

  sessionStorage.setItem('lastQuote', JSON.stringify(randomQuote));
}

// ====== Add New Quote ======
function addQuote() {
  const quoteText = document.getElementById("newQuoteText").value.trim();
  const quoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (!quoteText || !quoteCategory) {
    alert("Please enter both a quote and a category!");
    return;
  }

  const newQuote = {
    id: Date.now(),
    text: quoteText,
    category: quoteCategory
  };

  quotes.push(newQuote);
  saveQuotes();
  populateCategoryDropdown();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("Quote added successfully!");
}

// ====== Export Quotes to JSON ======
function exportQuotes() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// ====== Import Quotes from JSON ======
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes)) throw new Error("Invalid JSON format");
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategoryDropdown();
      alert('Quotes imported successfully!');
    } catch (err) {
      alert("Failed to import quotes: " + err.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ====== Fetch Server Quotes ======
async function fetchServerQuotes() {
  try {
    const response = await fetch(SERVER_URL);
    const serverData = await response.json();

    const serverQuotes = serverData.slice(0, 5).map(post => ({
      id: post.id,
      text: post.title,
      category: post.body || "General"
    }));

    resolveConflicts(serverQuotes);
  } catch (error) {
    console.log("Failed to fetch server data:", error);
  }
}

// ====== Resolve Conflicts ======
function resolveConflicts(serverQuotes) {
  let conflictsResolved = false;

  serverQuotes.forEach(sq => {
    const localIndex = quotes.findIndex(lq => lq.id === sq.id);

    if (localIndex === -1) {
      quotes.push(sq);
      conflictsResolved = true;
    } else {
      if (JSON.stringify(quotes[localIndex]) !== JSON.stringify(sq)) {
        quotes[localIndex] = sq;
        conflictsResolved = true;
      }
    }
  });

  if (conflictsResolved) {
    saveQuotes();
    populateCategoryDropdown();
    alert("Quotes have been updated from server and conflicts resolved!");
  }
}

// ====== Load Last Viewed Quote ======
window.onload = function() {
  populateCategoryDropdown();

  const lastQuote = JSON.parse(sessionStorage.getItem('lastQuote'));
  if (lastQuote) {
    document.getElementById("quoteDisplay").textContent = `"${lastQuote.text}" — (${lastQuote.category})`;
  }
};

// ====== Event Listeners ======
document.getElementById("newQuote").addEventListener("click", filterQuote);
document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
document.getElementById("exportQuotes").addEventListener("click", exportQuotes);
document.getElementById("categorySelect").addEventListener("change", filterQuote);

// ====== Periodic Server Sync ======
setInterval(fetchServerQuotes, 30000);