// 1. SELECTING ALL HTML ELEMENTS (Keeping your original names)
const nameInput = document.getElementById("name-input");
const addBtn = document.getElementById("att-add");
const clearBtn = document.getElementById("att-del");
const addDayBtn = document.getElementById("add-day");
const rmDayBtn = document.getElementById("rm-day");
const attHeader = document.getElementById("att-header");
const attBody = document.getElementById("att-body");
const logoutBtn = document.getElementById("logout-btn");

// 2. GLOBAL STATE (Now synced with Firestore)
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

// 4. THE DATA "LIVE WIRE" (Replaces localStorage load)
function startSyncing() {
  // Sync the total days setting
  db.collection("config")
    .doc("attendanceSettings")
    .onSnapshot((doc) => {
      if (doc.exists) {
        totalDays = doc.data().totalDays;
      } else {
        totalDays = 2; // Default if first time
      }
      render();
    });

  // Sync the student list in real-time
  db.collection("students")
    .orderBy("createdAt", "asc")
    .onSnapshot((snapshot) => {
      students = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      render();
    });
}

// 5. RENDERING LOGIC (Keeping your styling and logic)
function updateGridColumns() {
  document.documentElement.style.setProperty("--total-days", totalDays);
}

function initialiseHeader() {
  let html = `<div class="name-col">Student Name</div>`;
  for (let i = 1; i <= totalDays; i++) {
    let week = Math.ceil(i / 2);
    let day = i % 2 === 0 ? 2 : 1;
    html += `<div class='week_no'>W${week}.${day}</div>`;
  }
  html += `<div>%</div><div></div>`;
  attHeader.innerHTML = html;
}

function render() {
  updateGridColumns();
  initialiseHeader();
  attBody.innerHTML = "";

  students.forEach((student, sIdx) => {
    const row = document.createElement("article");
    row.className = "att_row";

    const attended = student.attendance.filter((v) => v).length;
    const percent =
      totalDays === 0 ? 0 : Math.round((attended / totalDays) * 100);

    let colorClass = "";
    if (percent >= 85) colorClass = "pct-green";
    else if (percent >= 75) colorClass = "pct-yellow";
    else colorClass = "pct-red";

    let cells = `<div class="name-col">${student.name}</div>`;

    student.attendance.forEach((status, dIdx) => {
      // Toggle now passes the specific Firestore Document ID
      cells += `<div><input type="checkbox" ${status ? "checked" : ""} onchange="toggle('${student.id}', ${dIdx}, ${status})"></div>`;
    });

    cells += `<div class="pct-cell ${colorClass}">${percent}%</div>`;
    cells += `<div><button class="row-del-btn" onclick="remove('${student.id}', '${student.name}')"><i class="ph ph-x"></i></button></div>`;

    row.innerHTML = cells;
    attBody.appendChild(row);
  });
}

// 6. ACTION LOGIC (Moving from localStorage.setItem to Cloud Updates)

addDayBtn.onclick = async () => {
  const newTotal = totalDays + 1;
  // Update setting in cloud
  await db
    .collection("config")
    .doc("attendanceSettings")
    .set({ totalDays: newTotal });

  // Update every student's attendance array
  const batch = db.batch();
  students.forEach((student) => {
    const ref = db.collection("students").doc(student.id);
    batch.update(ref, {
      attendance: [...student.attendance, false],
    });
  });
  await batch.commit();
};

rmDayBtn.onclick = async () => {
  if (
    totalDays > 0 &&
    confirm("Remove the last day? This will delete data for that day.")
  ) {
    const newTotal = totalDays - 1;
    await db
      .collection("config")
      .doc("attendanceSettings")
      .set({ totalDays: newTotal });

    const batch = db.batch();
    students.forEach((student) => {
      const ref = db.collection("students").doc(student.id);
      const newAtt = [...student.attendance];
      newAtt.pop();
      batch.update(ref, { attendance: newAtt });
    });
    await batch.commit();
  }
};

async function add() {
  const val = nameInput.value.trim();
  if (!val) return;

  await db.collection("students").add({
    name: val,
    attendance: new Array(totalDays).fill(false),
    note: "",
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });

  nameInput.value = "";
}

window.toggle = async (id, dIdx, currentStatus) => {
  const student = students.find((s) => s.id === id);
  const newAttendance = [...student.attendance];
  newAttendance[dIdx] = !currentStatus;

  await db.collection("students").doc(id).update({
    attendance: newAttendance,
  });
};

window.remove = async (id, name) => {
  if (confirm(`Remove ${name}?`)) {
    await db.collection("students").doc(id).delete();
  }
};

// Logout Function
if (logoutBtn) {
  logoutBtn.onclick = () => {
    auth.signOut().then(() => console.log("Signed out."));
  };
}

// Event Listeners for inputs
addBtn.onclick = add;
nameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    add();
  }
});

// 7. MASS DATA MANAGEMENT (The Clear All button)
clearBtn.onclick = async () => {
  if (
    confirm(
      "Warning: This will delete ALL student records from the cloud. Proceed?",
    )
  ) {
    const batch = db.batch();
    students.forEach((student) => {
      batch.delete(db.collection("students").doc(student.id));
    });
    await batch.commit();
  }
};
