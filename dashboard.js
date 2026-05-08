// 1. SELECTING HTML ELEMENTS
const dashList = document.getElementById("dash-list");
const logoutBtn = document.getElementById("logout-btn");

// 2. GLOBAL STATE
let students = [];
let totalDays = 0;

// 3. SECURITY GUARD & INITIALISATION
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    console.log("Authenticated as:", user.email);
    startSyncing();
  } else {
    window.location.href = "login.html";
  }
});

// 4. THE DATA "LIVE WIRE" (Syncing both config and students)
function startSyncing() {
  // Sync the total days setting (to keep percentage accurate)
  db.collection("config")
    .doc("attendanceSettings")
    .onSnapshot((doc) => {
      if (doc.exists) {
        totalDays = doc.data().totalDays;
      } else {
        totalDays = 2;
      }
      renderDashboard();
    });

  // Sync the student list and notes in real-time
  db.collection("students")
    .orderBy("createdAt", "asc")
    .onSnapshot((snapshot) => {
      students = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      renderDashboard();
    });
}

// 5. RENDERING LOGIC (Keeping your accordion and styling)
function renderDashboard() {
  dashList.innerHTML = "";

  if (students.length === 0) {
    dashList.innerHTML =
      "<p style='text-align:center; color:var(--accent-color);'>No students found. Add students on the attendance page first.</p>";
    return;
  }

  students.forEach((student, index) => {
    // Calculate Percentage
    const attended = student.attendance.filter((v) => v).length;
    const percent =
      totalDays === 0 ? 0 : Math.round((attended / totalDays) * 100);

    // Determine Colour Class
    let colourClass = "";
    if (percent >= 85) colourClass = "pct-green";
    else if (percent >= 75) colourClass = "pct-yellow";
    else colourClass = "pct-red";

    const currentNote = student.note || "";

    // Build the Card
    const card = document.createElement("article");
    card.className = "student-card";

    card.innerHTML = `
      <div class="card-header" onclick="toggleNotes(${index})">
        <div class="card-name-con">
            <i class="ph ph-note-pencil"></i>
            <span class="card-name">${student.name}</span>
        </div>
        <span class="card-pct ${colourClass}">${percent}%</span>
      </div>
      <div class="card-notes" id="notes-${index}">
        <textarea id="textarea-${index}" class="note-input" placeholder="Add progress notes for ${student.name}...">${currentNote}</textarea>
        <button class="save-note-btn" onclick="saveNote('${student.id}', ${index})" style="margin-bottom: 10px;"><i class="ph ph-note"></i></button>
        <span id="status-${index}" style="color: #16a34a; font-size: 1rem; display: none;">Saved!</span>
      </div>
    `;

    dashList.appendChild(card);
  });
}

// 6. ACTION LOGIC (Updating Firestore)

window.toggleNotes = (index) => {
  const notesContainer = document.getElementById(`notes-${index}`);
  notesContainer.classList.toggle("active");
};

// We now pass the Firestore ID to ensure we update the correct document
window.saveNote = async (id, index) => {
  const textarea = document.getElementById(`textarea-${index}`);
  const statusText = document.getElementById(`status-${index}`);
  const newNote = textarea.value;

  try {
    // Update ONLY the note field in the cloud
    await db.collection("students").doc(id).update({
      note: newNote,
    });

    // Visual feedback
    statusText.style.display = "inline";
    setTimeout(() => {
      statusText.style.display = "none";
    }, 2000);
  } catch (error) {
    console.error("Error saving note:", error);
    alert("Failed to save note. Please check your connection.");
  }
};

// Logout Function
if (logoutBtn) {
  logoutBtn.onclick = () => {
    auth.signOut().then(() => console.log("Signed out."));
  };
}
