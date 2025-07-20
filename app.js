const correctPassword = "1234";

function checkLogin() {
  const input = document.getElementById('password').value;
  if (input === correctPassword) {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    loadCustomers();
    checkBackupReminder();
  } else {
    alert("Incorrect password");
  }
}

function getCustomers() {
  return JSON.parse(localStorage.getItem("customers") || "[]");
}

function saveCustomers(data) {
  localStorage.setItem("customers", JSON.stringify(data));
  localStorage.setItem("lastBackup", new Date().toISOString());
}

function addCustomer() {
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const credit = parseFloat(document.getElementById("credit").value);
  const notes = document.getElementById("notes").value.trim();
  const date = new Date().toLocaleDateString();

  if (!name || isNaN(credit)) return alert("Enter valid name and credit");

  const customers = getCustomers();
  const existing = customers.find(c => c.name === name);

  if (existing) {
    existing.credit += credit;
    existing.date = date;
    existing.notes = notes;
    existing.phone = phone;
  } else {
    customers.push({ name, phone, credit, notes, date });
  }

  saveCustomers(customers);
  loadCustomers();
}

function loadCustomers() {
  const customers = getCustomers();
  const container = document.getElementById("customer-list");
  const dashboard = document.getElementById("dashboard");
  container.innerHTML = "";

  let total = 0, monthTotal = 0;
  const now = new Date();
  customers.forEach((c, i) => {
    total += c.credit;
    const cDate = new Date(c.date);
    if (cDate.getMonth() === now.getMonth() && cDate.getFullYear() === now.getFullYear())
      monthTotal += c.credit;

    container.innerHTML += `
      <div class="customer-card">
        <strong>${c.name}</strong> (${c.phone})<br>
        Credit: ₹${c.credit}<br>
        Notes: ${c.notes}<br>
        Date: ${c.date}<br>
        <button onclick="deleteCustomer(${i})">🗑 Delete</button>
      </div>`;
  });

  dashboard.innerHTML = `<h3>📊 Summary</h3>
    Total Customers: ${customers.length}<br>
    Total Credit: ₹${total}<br>
    This Month: ₹${monthTotal}<br>`;
}

function deleteCustomer(index) {
  const customers = getCustomers();
  customers.splice(index, 1);
  saveCustomers(customers);
  loadCustomers();
}

function searchCustomers() {
  const term = document.getElementById("search").value.toLowerCase();
  const customers = getCustomers();
  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(term) || c.date.includes(term));
  const container = document.getElementById("customer-list");
  container.innerHTML = "";
  filtered.forEach((c, i) => {
    container.innerHTML += `
      <div class="customer-card">
        <strong>${c.name}</strong> (${c.phone})<br>
        Credit: ₹${c.credit}<br>
        Notes: ${c.notes}<br>
        Date: ${c.date}<br>
        <button onclick="deleteCustomer(${i})">🗑 Delete</button>
      </div>`;
  });
}

function exportJSON() {
  const dataStr = JSON.stringify(getCustomers(), null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "customers.json";
  a.click();
}

function importJSON() {
  const file = document.getElementById("fileInput").files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      saveCustomers(imported);
      loadCustomers();
    } catch {
      alert("Invalid JSON");
    }
  };
  reader.readAsText(file);
}

function exportPDF() {
  const customers = getCustomers();
  let text = "Customer Report\n\n";
  customers.forEach(c => {
    text += `Name: ${c.name}\nPhone: ${c.phone}\nCredit: ₹${c.credit}\nNotes: ${c.notes}\nDate: ${c.date}\n\n`;
  });

  const blob = new Blob([text], { type: "application/pdf" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "customers.pdf";
  a.click();
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

function checkBackupReminder() {
  const last = localStorage.getItem("lastBackup");
  if (last) {
    const diff = (Date.now() - new Date(last).getTime()) / (1000 * 60 * 60 * 24);
    if (diff >= 7) {
      alert("⚠️ Reminder: Please export your data. Last backup was over 7 days ago.");
    }
  }
}