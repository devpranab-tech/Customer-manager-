const ADMIN_PASSWORD_HASH = "b3d39982ff4ac118ca1dbe9234b4096eab5d4bca88840794b9fc5619157b2a53";
let customers = [];

function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  return crypto.subtle.digest("SHA-256", data).then(buf => {
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  });
}

async function login() {
  const pass = document.getElementById("password").value;
  const hash = await sha256(pass);
  console.log("Entered Hash:", hash);
  console.log("Expected Hash:", ADMIN_PASSWORD_HASH);
  if (hash === ADMIN_PASSWORD_HASH) {
    document.getElementById("login").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    loadCustomers();
    backupAlert();
  } else {
    alert("Incorrect password");
  }
}

function saveCustomers() {
  localStorage.setItem("customers", JSON.stringify(customers));
  localStorage.setItem("lastBackup", Date.now());
  renderCustomers();
}

function loadCustomers() {
  const data = localStorage.getItem("customers");
  customers = data ? JSON.parse(data) : [];
  renderCustomers();
}

function addCustomer() {
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const credit = parseFloat(document.getElementById("credit").value) || 0;
  const note = document.getElementById("note").value.trim();
  if (!name || !phone) return alert("Name and phone required");

  const date = new Date().toISOString().split("T")[0];
  const existing = customers.find(c => c.name === name && c.phone === phone);
  if (existing) {
    existing.credit += credit;
    existing.note = note;
    existing.date = date;
  } else {
    customers.push({ name, phone, credit, note, date });
  }

  document.getElementById("name").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("credit").value = "";
  document.getElementById("note").value = "";
  saveCustomers();
}

function renderCustomers() {
  const search = document.getElementById("search").value.toLowerCase();
  const filterDate = document.getElementById("filterDate").value;
  const filterMonth = document.getElementById("filterMonth").value;
  const container = document.getElementById("customers");
  container.innerHTML = "";

  let totalCredit = 0;
  let filtered = customers.filter(c => {
    if (search && !c.name.toLowerCase().includes(search) && !c.phone.includes(search)) return false;
    if (filterDate && c.date !== filterDate) return false;
    if (filterMonth && !c.date.startsWith(filterMonth)) return false;
    return true;
  });

  filtered.forEach((c, i) => {
    totalCredit += c.credit;
    const div = document.createElement("div");
    div.className = "customer";
    div.innerHTML = `<b>${c.name}</b> (${c.phone})<br/>Credit: ₹${c.credit}<br/>Note: ${c.note}<br/>Date: ${c.date}
      <button onclick="deleteCustomer(${i})">Delete</button>`;
    container.appendChild(div);
  });

  document.getElementById("dashboard").innerHTML = `
    <p><b>Total Customers:</b> ${customers.length}</p>
    <p><b>Total Credit:</b> ₹${customers.reduce((t, c) => t + c.credit, 0)}</p>
    <p><b>This Month's Credit:</b> ₹${customers.filter(c => c.date.startsWith(new Date().toISOString().slice(0, 7)))
    .reduce((t, c) => t + c.credit, 0)}</p>
  `;
}

function deleteCustomer(index) {
  if (confirm("Delete this customer?")) {
    customers.splice(index, 1);
    saveCustomers();
  }
}

function exportJSON() {
  const blob = new Blob([JSON.stringify(customers)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "customers.json";
  a.click();
}

function importJSON() {
  document.getElementById("importFile").click();
}

document.getElementById("importFile").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      customers = data;
      saveCustomers();
    } catch (e) {
      alert("Invalid JSON");
    }
  };
  reader.readAsText(file);
});

function exportPDF() {
  let text = "Customer Report\n\n";
  customers.forEach(c => {
    text += `${c.name} (${c.phone}) - ₹${c.credit}\nNote: ${c.note}\nDate: ${c.date}\n\n`;
  });
  const blob = new Blob([text], { type: "application/pdf" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "customers.pdf";
  a.click();
}

function resetFilters() {
  document.getElementById("filterDate").value = "";
  document.getElementById("filterMonth").value = "";
  document.getElementById("search").value = "";
  renderCustomers();
}

function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  document.body.classList.toggle("light-mode");
}

function backupAlert() {
  const last = localStorage.getItem("lastBackup");
  if (last && Date.now() - parseInt(last) > 7 * 86400000) {
    alert("Reminder: Please export backup (7 days passed)");
  }
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}
