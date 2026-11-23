const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const TASKS_TABLE = "tasks";
const MIN_PASSWORD_LENGTH = 6;

const PRIORITY_LABELS = {
  dusuk: "Düşük",
  orta: "Orta",
  yuksek: "Yüksek",
};

const FILTERS = {
  hepsi: () => true,
  aktif: (task) => !task.is_done,
  tamamlanan: (task) => task.is_done,
};

const elements = {
  authSection: document.getElementById("auth-section"),
  authForm: document.getElementById("auth-form"),
  authMessage: document.getElementById("auth-message"),
  emailInput: document.getElementById("email"),
  passwordInput: document.getElementById("password"),
  signupButton: document.getElementById("signup-btn"),
  appSection: document.getElementById("app-section"),
  userEmail: document.getElementById("user-email"),
  logoutButton: document.getElementById("logout-btn"),
  taskForm: document.getElementById("task-form"),
  taskTitleInput: document.getElementById("task-title"),
  taskPrioritySelect: document.getElementById("task-priority"),
  taskList: document.getElementById("task-list"),
  taskCount: document.getElementById("task-count"),
  filterButtons: document.querySelectorAll(".filter"),
};

const state = {
  tasks: [],
  activeFilter: "hepsi",
};

function showAuthMessage(text, type = "error") {
  elements.authMessage.textContent = text;
  elements.authMessage.className = `message ${type}`;
}

function getCredentials() {
  return {
    email: elements.emailInput.value.trim(),
    password: elements.passwordInput.value,
  };
}

async function handleLogin(event) {
  event.preventDefault();
  const { error } = await supabaseClient.auth.signInWithPassword(getCredentials());
  if (error) showAuthMessage(`Giriş başarısız: ${error.message}`);
}

async function handleSignup() {
  const credentials = getCredentials();

  if (!credentials.email || credentials.password.length < MIN_PASSWORD_LENGTH) {
    showAuthMessage(`Geçerli e-posta ve en az ${MIN_PASSWORD_LENGTH} karakterli şifre girin.`);
    return;
  }

  const { data, error } = await supabaseClient.auth.signUp(credentials);

  if (error) {
    showAuthMessage(`Kayıt başarısız: ${error.message}`);
    return;
  }

  if (!data.session) {
    showAuthMessage("Kayıt başarılı! E-postanı onayladıktan sonra giriş yap.", "success");
  }
}

function handleLogout() {
  supabaseClient.auth.signOut();
}

function showAuthScreen() {
  elements.appSection.classList.add("hidden");
  elements.authSection.classList.remove("hidden");
  state.tasks = [];
  elements.taskList.innerHTML = "";
}

function showAppScreen(user) {
  elements.authSection.classList.add("hidden");
  elements.appSection.classList.remove("hidden");
  elements.userEmail.textContent = user.email;
  loadTasks();
}

function renderSession(session) {
  if (session) {
    showAppScreen(session.user);
  } else {
    showAuthScreen();
  }
}

async function loadTasks() {
  const { data, error } = await supabaseClient
    .from(TASKS_TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    alert(`Görevler yüklenemedi: ${error.message}`);
    return;
  }

  state.tasks = data;
  renderTasks();
}

async function createTask(event) {
  event.preventDefault();

  const title = elements.taskTitleInput.value.trim();
  if (!title) return;

  const { data, error } = await supabaseClient
    .from(TASKS_TABLE)
    .insert({ title, priority: elements.taskPrioritySelect.value })
    .select()
    .single();

  if (error) {
    alert(`Görev eklenemedi: ${error.message}`);
    return;
  }

  state.tasks.unshift(data);
  elements.taskTitleInput.value = "";
  renderTasks();
}

async function toggleTaskDone(task) {
  const isDone = !task.is_done;

  const { error } = await supabaseClient
    .from(TASKS_TABLE)
    .update({ is_done: isDone })
    .eq("id", task.id);

  if (error) {
    alert(`Görev güncellenemedi: ${error.message}`);
    return;
  }

  task.is_done = isDone;
  renderTasks();
}

async function deleteTask(task) {
  if (!confirm(`"${task.title}" silinsin mi?`)) return;

  const { error } = await supabaseClient.from(TASKS_TABLE).delete().eq("id", task.id);

  if (error) {
    alert(`Görev silinemedi: ${error.message}`);
    return;
  }

  state.tasks = state.tasks.filter((item) => item.id !== task.id);
  renderTasks();
}

function setActiveFilter(filterButton) {
  elements.filterButtons.forEach((button) => button.classList.remove("active"));
  filterButton.classList.add("active");
  state.activeFilter = filterButton.dataset.filter;
  renderTasks();
}

function createTaskCheckbox(task) {
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "task-checkbox";
  checkbox.checked = task.is_done;
  checkbox.addEventListener("change", () => toggleTaskDone(task));
  return checkbox;
}

function createTaskTitle(task) {
  const title = document.createElement("span");
  title.className = "title";
  title.textContent = task.title;
  return title;
}

function createPriorityBadge(task) {
  const badge = document.createElement("span");
  badge.className = `badge ${task.priority}`;
  badge.textContent = PRIORITY_LABELS[task.priority] ?? task.priority;
  return badge;
}

function createDeleteButton(task) {
  const button = document.createElement("button");
  button.className = "delete";
  button.textContent = "Sil";
  button.addEventListener("click", () => deleteTask(task));
  return button;
}

function createTaskItem(task) {
  const item = document.createElement("li");
  item.classList.toggle("done", task.is_done);
  item.append(
    createTaskCheckbox(task),
    createTaskTitle(task),
    createPriorityBadge(task),
    createDeleteButton(task)
  );
  return item;
}

function renderTaskCount() {
  const activeCount = state.tasks.filter(FILTERS.aktif).length;
  elements.taskCount.textContent = `${activeCount} aktif / ${state.tasks.length} toplam görev`;
}

function renderTasks() {
  const visibleTasks = state.tasks.filter(FILTERS[state.activeFilter]);
  elements.taskList.replaceChildren(...visibleTasks.map(createTaskItem));
  renderTaskCount();
}

function bindEvents() {
  elements.authForm.addEventListener("submit", handleLogin);
  elements.signupButton.addEventListener("click", handleSignup);
  elements.logoutButton.addEventListener("click", handleLogout);
  elements.taskForm.addEventListener("submit", createTask);
  elements.filterButtons.forEach((button) =>
    button.addEventListener("click", () => setActiveFilter(button))
  );
}

async function init() {
  bindEvents();
  supabaseClient.auth.onAuthStateChange((_event, session) => renderSession(session));
  const { data } = await supabaseClient.auth.getSession();
  renderSession(data.session);
}

init();
