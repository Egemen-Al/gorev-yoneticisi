const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const $ = (id) => document.getElementById(id);
const authSection = $("auth-section");
const appSection = $("app-section");
const authMessage = $("auth-message");
const taskList = $("task-list");

let tasks = [];
let currentFilter = "hepsi";

const PRIORITY_LABELS = { dusuk: "Düşük", orta: "Orta", yuksek: "Yüksek" };

function showMessage(text, type = "error") {
  authMessage.textContent = text;
  authMessage.className = `message ${type}`;
}

// ---------- Kimlik doğrulama ----------
$("auth-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const { error } = await db.auth.signInWithPassword({
    email: $("email").value,
    password: $("password").value,
  });
  if (error) showMessage("Giriş başarısız: " + error.message);
});

$("signup-btn").addEventListener("click", async () => {
  const email = $("email").value;
  const password = $("password").value;
  if (!email || password.length < 6) {
    return showMessage("Geçerli e-posta ve en az 6 karakterli şifre girin.");
  }
  const { data, error } = await db.auth.signUp({ email, password });
  if (error) return showMessage("Kayıt başarısız: " + error.message);
  if (!data.session) showMessage("Kayıt başarılı! E-postanı onayladıktan sonra giriş yap.", "success");
});

$("logout-btn").addEventListener("click", () => db.auth.signOut());

db.auth.onAuthStateChange((_event, session) => renderAuth(session));

function renderAuth(session) {
  if (session) {
    authSection.classList.add("hidden");
    appSection.classList.remove("hidden");
    $("user-email").textContent = session.user.email;
    loadTasks();
  } else {
    appSection.classList.add("hidden");
    authSection.classList.remove("hidden");
    tasks = [];
    taskList.innerHTML = "";
  }
}

// ---------- Görevler (CRUD) ----------
async function loadTasks() {
  const { data, error } = await db
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return alert("Görevler yüklenemedi: " + error.message);
  tasks = data;
  renderTasks();
}

$("task-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = $("task-title").value.trim();
  if (!title) return;
  const { data: { user } } = await db.auth.getUser();
  const { data, error } = await db
    .from("tasks")
    .insert({ title, priority: $("task-priority").value, user_id: user.id })
    .select()
    .single();
  if (error) return alert("Görev eklenemedi: " + error.message);
  tasks.unshift(data);
  $("task-title").value = "";
  renderTasks();
});

async function toggleTask(task) {
  const { error } = await db
    .from("tasks")
    .update({ is_done: !task.is_done })
    .eq("id", task.id);
  if (error) return alert("Güncellenemedi: " + error.message);
  task.is_done = !task.is_done;
  renderTasks();
}

async function deleteTask(task) {
  if (!confirm(`"${task.title}" silinsin mi?`)) return;
  const { error } = await db.from("tasks").delete().eq("id", task.id);
  if (error) return alert("Silinemedi: " + error.message);
  tasks = tasks.filter((t) => t.id !== task.id);
  renderTasks();
}

// ---------- Filtre ve çizim ----------
document.querySelectorAll(".filter").forEach((btn) =>
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderTasks();
  })
);

function renderTasks() {
  const visible = tasks.filter((t) =>
    currentFilter === "aktif" ? !t.is_done :
    currentFilter === "tamamlanan" ? t.is_done : true
  );

  taskList.innerHTML = "";
  for (const task of visible) {
    const li = document.createElement("li");
    if (task.is_done) li.classList.add("done");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.is_done;
    checkbox.style.width = "auto";
    checkbox.style.margin = "0";
    checkbox.addEventListener("change", () => toggleTask(task));

    const title = document.createElement("span");
    title.className = "title";
    title.textContent = task.title; // textContent: XSS'e karşı güvenli

    const badge = document.createElement("span");
    badge.className = `badge ${task.priority}`;
    badge.textContent = PRIORITY_LABELS[task.priority] || task.priority;

    const del = document.createElement("button");
    del.className = "delete";
    del.textContent = "✕";
    del.title = "Sil";
    del.addEventListener("click", () => deleteTask(task));

    li.append(checkbox, title, badge, del);
    taskList.appendChild(li);
  }

  const remaining = tasks.filter((t) => !t.is_done).length;
  $("task-count").textContent = `${remaining} aktif / ${tasks.length} toplam görev`;
}

// Sayfa açılışında mevcut oturumu kontrol et
db.auth.getSession().then(({ data }) => renderAuth(data.session));
