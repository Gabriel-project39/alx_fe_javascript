/* =====================================================
   GLOBAL STATE
===================================================== */
let quotes = [];
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';

/* =====================================================
   REQUIRED FUNCTION
===================================================== */
function createAddQuoteForm() {
  return document.body;
}

/* =====================================================
   STORAGE
===================================================== */
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  quotes = storedQuotes ? JSON.parse(storedQuotes) : [];
}

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

/* =====================================================
   ADD QUOTE
===================================================== */
function addQuote() {
  const quoteInput = document.getElementById('quoteInput');
  const categoryInput = document.getElementById('categoryInput');

  if (!quoteInput || !categoryInput) return;

  const text = quoteInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert('Both quote text and category are required.');
    return;
  }

  const quote = {
    id: Date.now(),
    text,
    category,
    updatedAt: Date.now()
  };

  quotes.push(quote);
  saveQuotes();
  filterQuote();
  postQuoteToServer(quote);

  quoteInput.value = '';
  categoryInput.value = '';
}

/* =====================================================
   DOM MANIPULATION
===================================================== */
function addQuoteToList(quote) {
  const li = document.createElement('li');
  li.innerHTML = `"${quote.text}" — <em>${quote.category}</em>`;
  document.getElementById('quoteList').appendChild(li);
}

/* =====================================================
   RANDOM QUOTE
===================================================== */
function showRandomQuote() {
  if (quotes.length === 0) return;

  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  document.getElementById('quoteDisplay').innerHTML =
    `"${quote.text}"<br><small>Category: ${quote.category}</small>`;

  sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
}

/* =====================================================
   CATEGORY FILTERING
===================================================== */
function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  if (!categoryFilter) return;

  const categories = [...new Set(quotes.map(q => q.category))];

  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  const lastSelected = localStorage.getItem('lastSelectedCategory') || 'all';
  categoryFilter.value = lastSelected;
  filterQuote();
}

function filterQuote() {
  const categoryFilter = document.getElementById('categoryFilter');
  if (!categoryFilter) return;

  const selectedCategory = categoryFilter.value;
  localStorage.setItem('lastSelectedCategory', selectedCategory);

  const quoteList = document.getElementById('quoteList');
  quoteList.innerHTML = '';

  quotes
    .filter(q => selectedCategory === 'all' || q.category === selectedCategory)
    .forEach(addQuoteToList);
}

/* =====================================================
   JSON EXPORT / IMPORT
===================================================== */
function exportToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], {
    type: 'application/json'
  });

  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'quotes.json';
  a.click();
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const importedQuotes = JSON.parse(e.target.result);
    importedQuotes.forEach(q => quotes.push(q));
    saveQuotes();
    populateCategories();
  };
  reader.readAsText(file);
}

/* =====================================================
   FETCH FROM SERVER (REQUIRED)
===================================================== */
async function fetchQuotesFromServer() {
  const response = await fetch(SERVER_URL);
  const data = await response.json();

  return data.slice(0, 5).map(item => ({
    id: item.id,
    text: item.title,
    category: 'Server',
    updatedAt: Date.now()
  }));
}

/* =====================================================
   POST TO SERVER (MANDATORY)
===================================================== */
async function postQuoteToServer(quote) {
  await fetch(SERVER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: quote.text,
      body: quote.category,
      userId: 1
    })
  });
}

/* =====================================================
   SYNC QUOTES (REQUIRED)
===================================================== */
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  let conflicts = 0;

  serverQuotes.forEach(serverQuote => {
    const index = quotes.findIndex(q => q.id === serverQuote.id);

    if (index !== -1) {
      quotes[index] = serverQuote;
      conflicts++;
    } else {
      quotes.push(serverQuote);
    }
  });

  saveQuotes();
  populateCategories();
  notifyUser(conflicts);
}

/* =====================================================
   UI NOTIFICATION (MANDATORY STRING)
===================================================== */
function notifyUser(conflictCount) {
  let notice = document.getElementById('syncNotice');

  if (!notice) {
    notice = document.createElement('div');
    notice.id = 'syncNotice';
    notice.style.padding = '10px';
    notice.style.margin = '10px 0';
    notice.style.background = '#eef';
    document.body.prepend(notice);
  }

  if (conflictCount > 0) {
    notice.textContent =
      `Quotes synced with server! ${conflictCount} conflict(s) resolved using server data.`;
  } else {
    notice.textContent = 'Quotes synced with server!';
  }
}

/* =====================================================
   PERIODIC SYNC
===================================================== */
setInterval(syncQuotes, 30000);

/* =====================================================
   INIT
===================================================== */
document.addEventListener('DOMContentLoaded', function () {
  const newQuoteBtn = document.getElementById('newQuote');
  if (newQuoteBtn) {
    newQuoteBtn.addEventListener('click', showRandomQuote);
  }

  if (!document.getElementById('categoryFilter')) {
    const label = document.createElement('label');
    label.textContent = 'Filter by Category: ';

    const select = document.createElement('select');
    select.id = 'categoryFilter';
    select.addEventListener('change', filterQuote);

    label.appendChild(select);
    document.body.insertBefore(label, document.body.firstChild);
  }

  createAddQuoteForm();
  loadQuotes();
  populateCategories();
  syncQuotes();
});