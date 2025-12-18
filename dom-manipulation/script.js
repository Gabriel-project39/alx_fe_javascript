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
  if (!select) return;

  select.innerHTML = "";

  // Default option
  const allOption = document.createElement("option");
  allOption.value = "All";
  allOption.textContent = "All";
  select.appendChild(allOption);

  // ✅ Extract unique categories
  const categories = [...new Set(quotes.map(q => q.category))];

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  });

  // ✅ Restore last selected category
  const savedCategory = localStorage.getItem("selectedCategory") || "All";
  select.value = savedCategory;
}

// ====== Show Random Quote ======
function showRandomQuote(list = quotes) {
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = "";

  if (list.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category!";
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
}

// ====== Filter Quote (REQUIRED) ======
function filterQuote() {
  const select = document.getElementById("categorySelect");
  if (!select) return;

  const selectedCategory = select.value;

  // ✅ Save selected category
  localStorage.setItem("selectedCategory", selectedCategory);

  let filteredQuotes = quotes;

  if (selectedCategory !== "All") {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }

  // ✅ Update displayed quotes
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

  // ✅ Category dropdown exists BEFORE populateCategories
  const categorySelect = document.createElement("select");
  categorySelect.id = "categorySelect";
  categorySelect.addEventListener("change", filterQuote);

  container.appendChild(textInput);
  container.appendChild(categoryInput);
  container.appendChild(addButton);
  container.appendChild(categorySelect);

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

  // ✅ Update categories and filtering in real time
  populateCategories();
  filterQuote();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// ====== Load Page ======
window.onload = function () {
  createAddQuoteForm();
  populateCategories();

  // ✅ Restore selected category on load
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
