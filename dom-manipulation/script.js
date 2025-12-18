// ====== Server simulation ======
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// ====== Initial Quotes ======
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { id: 1, text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { id: 2, text: "Your time is limited, so don’t waste it living someone else’s life.", category: "Life" },
  { id: 3, text: "Not how long, but how well you have lived is the main thing.", category: "Philosophy" }
];

// ====== Save Quotes ======
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ====== Populate Categories (REQUIRED) ======
function populateCategories() {
  const select = document.getElementById("categorySelect");
  select.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "All";
  defaultOption.textContent = "All";
  select.appendChild(defaultOption);

  // Extract unique categories
  const categories = [...new Set(quotes.map(q => q.category))];

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  });

  // Restore last selected category
  const savedCategory = localStorage.getItem("selectedCategory") || "All";
  select.value = savedCategory;
}

// ====== Show Random Quote ======
function showRandomQuote(list = quotes) {
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = "";

  if (list.length === 0) {
    quoteDisplay.textContent = "No quotes available!";
    return;
  }

  const randomIndex = Math.floor(Math.random() * list.length);
  const quote = list[randomIndex];

  const p = document.createElement("p");
  p.textContent = `"${quote.text}"`;

  const small = document.createElement("small");
  small.textContent = `Category: ${quote.category}`;

  quoteDisplay.appendChild(p);
  quoteDisplay.appendChild(small);

  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// ====== Filter Quote (REQUIRED) ======
function filterQuote() {
  const select = document.getElementById("categorySelect");
  const selectedCategory = select.value;

  // Save selected category
  localStorage.setItem("selectedCategory", selectedCategory);

  let filteredQuotes = quotes;

  if (selectedCategory !== "All") {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }

  showRandomQuote(filteredQuotes);
}

// ====== Create Add Quote Form ======
function createAddQuoteForm() {
  const container = document.createElement("div");

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  const categorySelect = document.createElement("select");
  categorySelect.id = "categorySelect";
  categorySelect.addEventListener("change", filterQuote);

  const exportBtn = document.createElement("button");
  exportBtn.textContent = "Export Quotes";
  exportBtn.addEventListener("click", exportToJsonFile);

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "application/json";
  fileInput.addEventListener("change", importFromJsonFile);

  container.appendChild(textInput);
  container.appendChild(categoryInput);
  container.appendChild(addButton);
  container.appendChild(categorySelect);
  container.appendChild(fileInput);
  container.appendChild(exportBtn);

  document.body.appendChild(container);
}

// ====== Add Quote ======
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please enter both fields");
    return;
  }

  quotes.push({
    id: Date.now(),
    text,
    category
  });

  saveQuotes();
  populateCategories();
  filterQuote();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// ====== Export to JSON ======
function exportToJsonFile() {
  const jsonData = JSON.stringify(quotes, null, 2);
  const blob = new Blob([jsonData], { type: "application/json" });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

// ====== Import from JSON ======
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes)) throw new Error();

      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      filterQuote();
    } catch {
      alert("Invalid JSON file");
    }
  };
  reader.readAsText(event.target.files[0]);
}

// ====== Load Page ======
window.onload = function () {
  createAddQuoteForm();
  populateCategories();

  const savedCategory = localStorage.getItem("selectedCategory") || "All";
  document.getElementById("categorySelect").value = savedCategory;

  filterQuote();
};

// ====== Show New Quote Button ======
document.getElementById("newQuote").addEventListener("click", filterQuote);

// ====== Periodic Server Sync ======
async function fetchServerQuotes() {
  try {
    const response = await fetch(SERVER_URL);
    const data = await response.json();

    const serverQuotes = data.slice(0, 5).map(post => ({
      id: post.id,
      text: post.title,
      category: "Server"
    }));

    serverQuotes.forEach(sq => {
      if (!quotes.some(q => q.id === sq.id)) {
        quotes.push(sq);
      }
    });

    saveQuotes();
    populateCategories();
  } catch {}
}

setInterval(fetchServerQuotes, 30000);
