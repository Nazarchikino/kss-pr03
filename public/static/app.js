// Клієнтський код сторінки: усі дані отримуються з API через fetch.
let token = null;

async function loadTickets() {
  const res = await fetch("/api/tickets?pageSize=20");
  const data = await res.json();
  document.getElementById("rows").innerHTML = data.items
    .map((t) => `<tr><td>${t.id}</td><td>${escapeHtml(t.title)}</td><td>${t.status}</td><td>${t.priority}</td></tr>`)
    .join("");
  document.getElementById("meta").textContent =
    `Статус ${res.status}, заявок: ${data.total}, X-Request-Id: ${res.headers.get("X-Request-Id")}`;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

document.getElementById("login").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
  });
  const data = await res.json();
  if (res.ok) {
    token = data.accessToken;
    document.getElementById("who").textContent = `Ви увійшли як ${data.user.fullName} (${data.user.role})`;
  } else {
    document.getElementById("who").textContent = `${res.status}: ${data.detail}`;
  }
});

document.getElementById("create").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const res = await fetch("/api/tickets", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ title: form.get("title"), priority: form.get("priority") }),
  });
  const data = await res.json();
  document.getElementById("createResult").textContent = res.ok
    ? `${res.status} Created, Location: ${res.headers.get("Location")}`
    : `${res.status}: ${data.detail}${data.errors ? " – " + data.errors.map((x) => `${x.field}: ${x.message}`).join("; ") : ""}`;
  if (res.ok) loadTickets();
});

document.getElementById("reload").addEventListener("click", loadTickets);
document.getElementById("slow").addEventListener("click", async () => {
  const res = await fetch("/api/slow?ms=2000");
  document.getElementById("meta").textContent = `Повільний запит: ${res.status}, ${JSON.stringify(await res.json())}`;
});

loadTickets();
