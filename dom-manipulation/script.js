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

// ====== Show Random Quote (REQUIRED) ======
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

// ====== Create Add Quote Form (REQUIRED) ======
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

  // ====== Import File Input (REQUIRED) ======
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "application/json";
  fileInput.addEventListener("change", importFromJsonFile);

  // ====== Export Button ======
  const exportBtn = document.createElement("button");
  exportBtn.textContent = "Export Quotes";
  exportBtn.addEventListener("click", exportToJsonFile);

  formDiv.appendChild(textInput);
  formDiv.appendChild(categoryInput);
  formDiv.appendChild(addButton);
  formDiv.appendChild(fileInput);
  formDiv.appendChild(exportBtn);

  document.body.appendChild(formDiv);
}

// ====== Add Quote ======
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category!");
    return;
  }

  quotes.push({
    id: Date.now(),
    text,
    category
  });

  saveQuotes();
  showRandomQuote();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// ====== EXPORT TO JSON (REQUIRED NAME + Blob) ======
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

// ====== IMPORT FROM JSON (REQUIRED NAME) ======
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);

      if (!Array.isArray(importedQuotes)) {
        throw new Error("Invalid JSON format");
      }

      quotes.push(...importedQuotes);
      saveQuotes();
      showRandomQuote();
      alert("Quotes imported successfully!");
    } catch (err) {
      alert("Failed to import quotes");
    }
  };

  reader.readAsText(file);
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
    console.log("Server fetch failed");
  }
}

// ====== Resolve Conflicts ======
function resolveConflicts(serverQuotes) {
  serverQuotes.forEach(sq => {
    const index = quotes.findIndex(q => q.id === sq.id);
    if (index === -1) {
      quotes.push(sq);
    } else {
      quotes[index] = sq;
    }
  });
  saveQuotes();
}

// ====== Load ======
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
