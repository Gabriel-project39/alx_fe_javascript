// ====== Server simulation ======
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// ====== Initial Quotes ======
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { id: 1, text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { id: 2, text: "Your time is limited, so don’t waste it living someone else’s life.", category: "Life" },
  { id: 3, text: "Not how long, but how well you have lived is the main thing.", category: "Philosophy" }
];

// ====== Save to localStorage ======
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ====== Show Random Quote (REQUIRED NAME) ======
function showRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = "";

  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available!";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  const p = document.createElement("p");
  p.textContent = `"${quote.text}"`;

  const small = document.createElement("small");
  small.textContent = `Category: ${quote.category}`;

  quoteDisplay.appendChild(p);
  quoteDisplay.appendChild(small);

  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// ====== Create Add Quote Form (REQUIRED NAME) ======
function createAddQuoteForm() {
  const formDiv = document.createElement("div");

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.id = "addQuoteBtn";
  addButton.textContent = "Add Quote";

  addButton.addEventListener("click", addQuote);

  formDiv.appendChild(textInput);
  formDiv.appendChild(categoryInput);
  formDiv.appendChild(addButton);

  document.body.appendChild(formDiv);
}

// ====== Add New Quote (Logic Check) ======
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category!");
    return;
  }

  const newQuote = {
    id: Date.now(),
    text,
    category
  };

  quotes.push(newQuote);
  saveQuotes();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  showRandomQuote();
}

// ====== Fetch Server Quotes ======
async function fetchServerQuotes() {
  try {
    const response = await fetch(SERVER_URL);
    const data = await response.json();

    const serverQuotes = data.slice(0, 5).map(post => ({
      id: post.id,
      text: post.title,
      category: "Server"
    }));

    resolveConflicts(serverQuotes);
  } catch (err) {
    console.log("Server fetch failed:", err);
  }
}

// ====== Resolve Conflicts ======
function resolveConflicts(serverQuotes) {
  let updated = false;

  serverQuotes.forEach(sq => {
    const index = quotes.findIndex(q => q.id === sq.id);
    if (index === -1) {
      quotes.push(sq);
      updated = true;
    } else {
      quotes[index] = sq;
      updated = true;
    }
  });

  if (updated) {
    saveQuotes();
  }
}

// ====== Load Last Quote ======
window.onload = function () {
  createAddQuoteForm();

  const lastQuote = JSON.parse(sessionStorage.getItem("lastQuote"));
  if (lastQuote) {
    document.getElementById("quoteDisplay").textContent =
      `"${lastQuote.text}" — (${lastQuote.category})`;
  } else {
    showRandomQuote();
  }
};

// ====== REQUIRED EVENT LISTENER ======
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// ====== Periodic Server Sync ======
setInterval(fetchServerQuotes, 30000);
