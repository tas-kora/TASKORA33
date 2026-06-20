/* =========================
   FIREBASE IMPORTS
========================= */

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {

  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword

} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {

  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  increment,
  onSnapshot,
  query,
  where,
  deleteDoc

} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

/* =========================
   FIREBASE CONFIG
========================= */

const firebaseConfig = {

  apiKey: "AIzaSyAgoc71aRSRbYDPNRykLeuPXhBEQpnhOaU",

  authDomain:
  "task-platform-ef582.firebaseapp.com",

  projectId:
  "task-platform-ef582",

  storageBucket:
  "task-platform-ef582.firebasestorage.app",

  messagingSenderId:
  "226991710346",

  appId:
  "1:226991710346:web:18cb4586e7d8e43dfc4d73"

};

/* =========================
   INITIALIZE FIREBASE
========================= */

const app =
  initializeApp(firebaseConfig);

const auth =
  getAuth(app);

const db =
  getFirestore(app);

/* =========================
   PAGE NAVIGATION
========================= */

window.showSection =
function(sectionId){

  const sections =
    document.querySelectorAll(
      ".page-section"
    );

  sections.forEach((section) => {

    section.style.display =
      "none";

  });

  document.getElementById(
    sectionId
  ).style.display = "block";

};

window.showAdminSection =
function(sectionId){

  const sections =
    document.querySelectorAll(
      ".admin-section"
    );

  sections.forEach((section) => {

    section.style.display =
      "none";

  });

  document.getElementById(
    sectionId
  ).style.display = "block";

};

/* =========================
   LOGIN SYSTEM
========================= */

const loginBtn =
  document.getElementById(
    "loginBtn"
  );

if(loginBtn){

  loginBtn.addEventListener(
    "click",
    async() => {

      const email =
        document.getElementById(
          "email"
        ).value;

      const password =
        document.getElementById(
          "password"
        ).value;

      const message =
        document.getElementById(
          "message"
        );

      if(
        email === "" ||
        password === ""
      ){

        message.innerText =
          "Please fill all fields";

        return;

      }

      try{

        const userCredential =
          await signInWithEmailAndPassword(
            auth,
            email,
            password
          );

        const user =
          userCredential.user;

        const userRef =
          doc(
            db,
            "users",
            user.uid
          );

        const userSnap =
          await getDoc(userRef);

        if(userSnap.exists()){

          const data =
            userSnap.data();

          if(
            data.role === "admin"
          ){

            window.location.href =
              "admin.html";

          }else{

            window.location.href =
              "dashboard.html";

          }

        }

      }catch(error){

        message.innerText =
          "Invalid email or password";

        console.log(error);

      }

    }
  );

}

/* =========================
   AUTH CHECK
========================= */

onAuthStateChanged(
  auth,
  async(user) => {

    const currentPage =
      window.location.pathname;

    if(
      currentPage.includes(
        "dashboard.html"
      )
    ){

      if(!user){

        window.location.href =
          "login.html";

      }

    }

    if(
      currentPage.includes(
        "admin.html"
      )
    ){

      if(!user){

        window.location.href =
          "login.html";

      }else{

        const userRef =
          doc(
            db,
            "users",
            user.uid
          );

        const userSnap =
          await getDoc(userRef);

        if(userSnap.exists()){

          const data =
            userSnap.data();

          if(
            data.role !==
            "admin"
          ){

            window.location.href =
              "dashboard.html";

          }

        }

      }

    }

  }
);

/* =========================
   LOGOUT
========================= */

const logoutBtn =
  document.getElementById(
    "logoutBtn"
  );

if(logoutBtn){

  logoutBtn.addEventListener(
    "click",
    async() => {

      await signOut(auth);

      window.location.href =
        "login.html";

    }
  );

}

/* =========================
   CREATE USERS
========================= */

const createUserBtn =
  document.getElementById(
    "createUserBtn"
  );

if(createUserBtn){

  createUserBtn.addEventListener(
    "click",
    async() => {

      const email =
        document.getElementById(
          "newUserEmail"
        ).value;

      const password =
        document.getElementById(
          "newUserPassword"
        ).value;

      if(
        email === "" ||
        password === ""
      ){

        alert(
          "Fill all fields"
        );

        return;

      }

      try{

        const userCredential =
          await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );

        const user =
          userCredential.user;

        await setDoc(
          doc(
            db,
            "users",
            user.uid
          ),
          {

            email: email,

            role: "user",

            balance: 0,

            totalEarnings: 0,

            completedTasks: 0,

            createdAt:
            Date.now()

          }
        );

        alert(
          "User created successfully"
        );

      }catch(error){

        console.log(error);

      }

    }
  );

}

/* =========================
   CREATE TASK
========================= */

const createTaskBtn =
  document.getElementById(
    "createTaskBtn"
  );

if(createTaskBtn){

  createTaskBtn.addEventListener(
    "click",
    async() => {

      const title =
        document.getElementById(
          "taskTitle"
        ).value;

      const description =
        document.getElementById(
          "taskDescription"
        ).value;

      const price =
        document.getElementById(
          "taskPrice"
        ).value;

      if(
        title === "" ||
        description === "" ||
        price === ""
      ){

        alert(
          "Fill all fields"
        );

        return;

      }

      try{

        await addDoc(
          collection(
            db,
            "tasks"
          ),
          {

            title: title,

            description:
            description,

            price:
            Number(price),

            enabled: true,

            createdAt:
            Date.now()

          }
        );

        alert(
          "Task created"
        );

      }catch(error){

        console.log(error);

      }

    }
  );

}

/* =========================
   LOAD TASKS
========================= */

const taskList =
  document.getElementById(
    "taskList"
  );

function loadTasks(){

  if(taskList){

    onSnapshot(
      collection(
        db,
        "tasks"
      ),
      (snapshot) => {

        taskList.innerHTML =
          "";

        snapshot.forEach(
          (docSnap) => {

            const task =
              docSnap.data();

            taskList.innerHTML += `

            <div class="task-card">

              <h3>
                ${task.title}
              </h3>

              <p>
                ${task.description}
              </p>

              <div class="task-footer">

                <span>
                  $${task.price}
                </span>

                ${
                  task.enabled !== false

                  ?

                  `<button
                    onclick="
                      openSubmissionModal(
                        '${docSnap.id}'
                      )
                    "
                  >

                    Submit Task

                  </button>`

                  :

                  `<button
                    style="
                      background:#ef4444;
                    "
                  >

                    Not Eligible At The Moment

                  </button>`
                }

              </div>

            </div>

            `;

          }
        );

      }
    );

  }

}

loadTasks();

/* =========================
   ADMIN TASKS
========================= */

const adminTaskList =
  document.getElementById(
    "adminTaskList"
  );

function loadAdminTasks(){

  if(adminTaskList){

    onSnapshot(
      collection(
        db,
        "tasks"
      ),
      (snapshot) => {

        adminTaskList.innerHTML =
          "";

        snapshot.forEach(
          (docSnap) => {

            const task =
              docSnap.data();

            adminTaskList.innerHTML += `

            <div class="task-card">

              <h3>
                ${task.title}
              </h3>

              <p>
                ${task.description}
              </p>

              <div class="task-footer">

                <span>
                  $${task.price}
                </span>

                ${
                  task.enabled !== false

                  ?

                  `<button
                    onclick="
                      disableTask(
                        '${docSnap.id}'
                      )
                    "
                  >
                    Disable
                  </button>`

                  :

                  `<button
                    onclick="
                      enableTask(
                        '${docSnap.id}'
                      )
                    "
                  >
                    Enable
                  </button>`
                }

              </div>

            </div>

            `;

          }
        );

      }
    );

  }

}

loadAdminTasks();

/* =========================
   ENABLE TASK
========================= */

window.enableTask =
async function(taskId){

  await updateDoc(
    doc(
      db,
      "tasks",
      taskId
    ),
    {

      enabled: true

    }
  );

};

/* =========================
   DISABLE TASK
========================= */

window.disableTask =
async function(taskId){

  await updateDoc(
    doc(
      db,
      "tasks",
      taskId
    ),
    {

      enabled: false

    }
  );

};

/* =========================
   SUBMISSION MODAL
========================= */

let selectedTaskId =
  "";

window.openSubmissionModal =
function(taskId){

  selectedTaskId =
    taskId;

  document.getElementById(
    "submissionModal"
  ).style.display =
    "flex";

};

const closeModalBtn =
  document.getElementById(
    "closeModalBtn"
  );

if(closeModalBtn){

  closeModalBtn.addEventListener(
    "click",
    () => {

      document.getElementById(
        "submissionModal"
      ).style.display =
        "none";

    }
  );

}

/* =========================
   SUBMIT TASK
========================= */

const submitTaskBtn =
  document.getElementById(
    "submitTaskBtn"
  );

if(submitTaskBtn){

  submitTaskBtn.addEventListener(
    "click",
    async() => {

      const proof =
        document.getElementById(
          "submissionText"
        ).value;

      const user =
        auth.currentUser;

      if(proof === ""){

        alert(
          "Enter proof"
        );

        return;

      }

      try{

        await addDoc(
          collection(
            db,
            "submissions"
          ),
          {

            taskId:
            selectedTaskId,

            userId:
            user.uid,

            email:
            user.email,

            proof:
            proof,

            verification:
            "Pending",

            payment:
            "Pending",

            createdAt:
            Date.now()

          }
        );

        alert(
          "Task submitted"
        );

        document.getElementById(
          "submissionModal"
        ).style.display =
          "none";

      }catch(error){

        console.log(error);

      }

    }
  );

}

/* =========================
   LOAD SUBMISSIONS
========================= */

const submissionList =
  document.getElementById(
    "submissionList"
  );

function loadSubmissions(){

  if(submissionList){

    onSnapshot(
      collection(
        db,
        "submissions"
      ),
      async(snapshot) => {

        submissionList.innerHTML =
          "";

        snapshot.forEach(
          async(docSnap) => {

            const submission =
              docSnap.data();

            /* SHOW ONLY PENDING */

            if(
              submission.verification !==
              "Pending"
            ){

              return;

            }

            /* GET TASK */

            const taskRef =
              doc(
                db,
                "tasks",
                submission.taskId
              );

            const taskSnap =
              await getDoc(
                taskRef
              );

            let taskTitle =
              "Unknown Task";

            let taskPrice =
              0;

            if(taskSnap.exists()){

              const taskData =
                taskSnap.data();

              taskTitle =
                taskData.title;

              taskPrice =
                taskData.price;

            }

            submissionList.innerHTML += `

            <div class="submission-card">

              <h3>
                ${submission.email}
              </h3>

              <p
                style="
                  margin-top:12px;
                "
              >

                <strong>
                  Task:
                </strong>

                ${taskTitle}

              </p>

              <p
                style="
                  margin-top:12px;
                "
              >

                <strong>
                  Proof:
                </strong>

                ${submission.proof}

              </p>

              <p
                style="
                  margin-top:12px;
                "
              >

                <strong>
                  Reward:
                </strong>

                $${taskPrice}

              </p>

              <div class="submission-actions">

                <button
                  onclick="
                    approveSubmission(
                      '${docSnap.id}',
                      '${submission.userId}',
                      ${taskPrice},
                      '${taskTitle}'
                    )
                  "
                >

                  Approve

                </button>

                <button
                  onclick="
                    rejectSubmission(
                      '${docSnap.id}',
                      '${submission.userId}',
                      '${taskTitle}'
                    )
                  "
                  style="
                    background:#ef4444;
                  "
                >

                  Reject

                </button>

              </div>

            </div>

            `;

          }
        );

      }
    );

  }

}

loadSubmissions();

/* =========================
   APPROVE SUBMISSION
========================= */

window.approveSubmission =
async function(

  submissionId,
  userId,
  amount,
  taskTitle

){

  try{

    const submissionRef =
      doc(
        db,
        "submissions",
        submissionId
      );

    /* MARK DONE */

    await updateDoc(
      submissionRef,
      {

        verification:
        "Done",

        payment:
        "Paid"

      }
    );

    /* UPDATE USER */

    const userRef =
      doc(
        db,
        "users",
        userId
      );

    await updateDoc(
      userRef,
      {

        balance:
        increment(amount),

        totalEarnings:
        increment(amount),

        completedTasks:
        increment(1)

      }
    );

    /* HISTORY */

    await addDoc(
      collection(
        db,
        "history"
      ),
      {

        userId:
        userId,

        title:
        taskTitle,

        amount:
        amount,

        createdAt:
        Date.now()

      }
    );

    /* NOTIFICATION */

    await addDoc(
      collection(
        db,
        "notifications"
      ),
      {

        userId:
        userId,

        title:
        "Task Approved",

        message:
        `You earned $${amount} from ${taskTitle}`,

        createdAt:
        Date.now()

      }
    );

    alert(
      "Submission approved"
    );

  }catch(error){

    console.log(error);

  }

};

/* =========================
   REJECT SUBMISSION
========================= */

window.rejectSubmission =
async function(

  submissionId,
  userId,
  taskTitle

){

  try{

    const submissionRef =
      doc(
        db,
        "submissions",
        submissionId
      );

    await updateDoc(
      submissionRef,
      {

        verification:
        "Rejected"

      }
    );

    /* NOTIFICATION */

    await addDoc(
      collection(
        db,
        "notifications"
      ),
      {

        userId:
        userId,

        title:
        "Task Rejected",

        message:
        `${taskTitle} was rejected during verification.`,

        createdAt:
        Date.now()

      }
    );

    alert(
      "Submission rejected"
    );

  }catch(error){

    console.log(error);

  }

};

/* =========================
   USER BALANCE
========================= */

const userBalance =
  document.getElementById(
    "userBalance"
  );

const completedTasks =
  document.getElementById(
    "completedTasks"
  );

const totalEarnings =
  document.getElementById(
    "totalEarnings"
  );

function loadUserData(){

  if(userBalance){

    onAuthStateChanged(
      auth,
      (user) => {

        if(user){

          const userRef =
            doc(
              db,
              "users",
              user.uid
            );

          onSnapshot(
            userRef,
            (docSnap) => {

              if(docSnap.exists()){

                const data =
                  docSnap.data();

                userBalance.innerText =
                  "$" +
                  (
                    data.balance || 0
                  );

                completedTasks.innerText =
                  data.completedTasks || 0;

                totalEarnings.innerText =
                  "$" +
                  (
                    data.totalEarnings || 0
                  );

              }

            }
          );

        }

      }
    );

  }

}

loadUserData();

/* =========================
   PENDING REVIEWS
========================= */

const pendingReviews =
  document.getElementById(
    "pendingReviews"
  );

function loadPendingReviews(){

  if(pendingReviews){

    onAuthStateChanged(
      auth,
      (user) => {

        if(user){

          const q =
            query(
              collection(
                db,
                "submissions"
              ),
              where(
                "userId",
                "==",
                user.uid
              ),
              where(
                "verification",
                "==",
                "Pending"
              )
            );

          onSnapshot(
            q,
            (snapshot) => {

              pendingReviews.innerText =
                snapshot.size;

            }
          );

        }

      }
    );

  }

}

loadPendingReviews();

/* =========================
   VERIFICATION STATUS
========================= */

const verificationList =
  document.getElementById(
    "verificationList"
  );

function loadVerificationStatus(){

  if(verificationList){

    onAuthStateChanged(
      auth,
      (user) => {

        if(user){

          const q =
            query(
              collection(
                db,
                "submissions"
              ),
              where(
                "userId",
                "==",
                user.uid
              )
            );

          onSnapshot(
            q,
            async(snapshot) => {

              verificationList.innerHTML =
                "";

              snapshot.forEach(
                async(docSnap) => {

                  const submission =
                    docSnap.data();

                  const taskRef =
                    doc(
                      db,
                      "tasks",
                      submission.taskId
                    );

                  const taskSnap =
                    await getDoc(
                      taskRef
                    );

                  let taskTitle =
                    "Task";

                  if(taskSnap.exists()){

                    taskTitle =
                      taskSnap.data().title;

                  }

                  verificationList.innerHTML += `

                  <div class="history-card">

                    <div>

                      <h3>
                        ${taskTitle}
                      </h3>

                      <p
                        style="
                          color:#9ca3af;
                          margin-top:8px;
                        "
                      >

                        Verification:
                        ${submission.verification}

                      </p>

                      <p
                        style="
                          color:#9ca3af;
                          margin-top:5px;
                        "
                      >

                        Payment:
                        ${submission.payment}

                      </p>

                    </div>

                    <span>

                      ${submission.payment}

                    </span>

                  </div>

                  `;

                }
              );

            }
          );

        }

      }
    );

  }

}

loadVerificationStatus();

/* =========================
   EARNINGS HISTORY
========================= */

const earningsHistory =
  document.getElementById(
    "earningsHistory"
  );

function loadHistory(){

  if(earningsHistory){

    onAuthStateChanged(
      auth,
      (user) => {

        if(user){

          const q =
            query(
              collection(
                db,
                "history"
              ),
              where(
                "userId",
                "==",
                user.uid
              )
            );

          onSnapshot(
            q,
            (snapshot) => {

              earningsHistory.innerHTML =
                "";

              snapshot.forEach(
                (docSnap) => {

                  const history =
                    docSnap.data();

                  const date =
                    new Date(
                      history.createdAt
                    );

                  earningsHistory.innerHTML += `

                  <div class="history-card">

                    <div>

                      <h3>
                        ${history.title}
                      </h3>

                      <p
                        style="
                          color:#9ca3af;
                          margin-top:8px;
                        "
                      >

                        ${date.toLocaleString()}

                      </p>

                    </div>

                    <span>

                      +$${history.amount}

                    </span>

                  </div>

                  `;

                }
              );

            }
          );

        }

      }
    );

  }

}

loadHistory();

/* =========================
   WITHDRAW SYSTEM
========================= */

const withdrawBtn =
  document.getElementById(
    "withdrawBtn"
  );

if(withdrawBtn){

  withdrawBtn.addEventListener(
    "click",
    async() => {

      const amount =
        document.getElementById(
          "withdrawAmount"
        ).value;

      const method =
        document.getElementById(
          "withdrawMethod"
        ).value;

      const details =
        document.getElementById(
          "withdrawDetails"
        ).value;

      const user =
        auth.currentUser;

      if(
        amount === "" ||
        details === ""
      ){

        alert(
          "Fill all fields"
        );

        return;

      }

      try{

        const userRef =
          doc(
            db,
            "users",
            user.uid
          );

        const userSnap =
          await getDoc(
            userRef
          );

        const userData =
          userSnap.data();

        if(
          Number(amount) >
          userData.balance
        ){

          alert(
            "Insufficient balance"
          );

          return;

        }

        await addDoc(
          collection(
            db,
            "withdrawals"
          ),
          {

            userId:
            user.uid,

            email:
            user.email,

            amount:
            Number(amount),

            method:
            method,

            details:
            details,

            status:
            "Pending",

            createdAt:
            Date.now()

          }
        );

        alert(
          "Withdrawal request sent"
        );

      }catch(error){

        console.log(error);

      }

    }
  );

}

/* =========================
   LOAD WITHDRAWALS
========================= */

const withdrawalList =
  document.getElementById(
    "withdrawalList"
  );

function loadWithdrawals(){

  if(withdrawalList){

    onSnapshot(
      collection(
        db,
        "withdrawals"
      ),
      (snapshot) => {

        withdrawalList.innerHTML =
          "";

        snapshot.forEach(
          (docSnap) => {

            const withdrawal =
              docSnap.data();

            /* ONLY PENDING */

            if(
              withdrawal.status !==
              "Pending"
            ){

              return;

            }

            withdrawalList.innerHTML += `

            <div class="withdraw-card">

              <h3>
                ${withdrawal.email}
              </h3>

              <p
                style="
                  margin-top:12px;
                "
              >

                <strong>
                  Amount:
                </strong>

                $${withdrawal.amount}

              </p>

              <p
                style="
                  margin-top:12px;
                "
              >

                <strong>
                  Method:
                </strong>

                ${withdrawal.method}

              </p>

              <p
                style="
                  margin-top:12px;
                "
              >

                <strong>
                  Details:
                </strong>

                ${withdrawal.details}

              </p>

              <div class="withdraw-actions">

                <button
                  onclick="
                    approveWithdrawal(
                      '${docSnap.id}',
                      '${withdrawal.userId}',
                      ${withdrawal.amount}
                    )
                  "
                >

                  Mark Paid

                </button>

              </div>

            </div>

            `;

          }
        );

      }
    );

  }

}

loadWithdrawals();

/* =========================
   APPROVE WITHDRAWAL
========================= */

window.approveWithdrawal =
async function(

  withdrawalId,
  userId,
  amount

){

  try{

    const withdrawalRef =
      doc(
        db,
        "withdrawals",
        withdrawalId
      );

    await updateDoc(
      withdrawalRef,
      {

        status:
        "Paid"

      }
    );

    const userRef =
      doc(
        db,
        "users",
        userId
      );

    await updateDoc(
      userRef,
      {

        balance:
        increment(
          -amount
        )

      }
    );

    await addDoc(
      collection(
        db,
        "notifications"
      ),
      {

        userId:
        userId,

        title:
        "Withdrawal Paid",

        message:
        `$${amount} withdrawal was approved.`,

        createdAt:
        Date.now()

      }
    );

    alert(
      "Withdrawal marked paid"
    );

  }catch(error){

    console.log(error);

  }

};

/* =========================
   NOTIFICATIONS
========================= */

const notificationList =
  document.getElementById(
    "notificationList"
  );

const notificationCount =
  document.getElementById(
    "notificationCount"
  );

function loadNotifications(){

  if(notificationList){

    onAuthStateChanged(
      auth,
      (user) => {

        if(user){

          const q =
            query(
              collection(
                db,
                "notifications"
              ),
              where(
                "userId",
                "==",
                user.uid
              )
            );

          onSnapshot(
            q,
            (snapshot) => {

              notificationList.innerHTML =
                "";

              notificationCount.innerText =
                snapshot.size;

              snapshot.forEach(
                (docSnap) => {

                  const notification =
                    docSnap.data();

                  notificationList.innerHTML += `

                  <div class="notification-item">

                    <h3>
                      ${notification.title}
                    </h3>

                    <p
                      style="
                        color:#9ca3af;
                        margin-top:10px;
                        line-height:1.8;
                      "
                    >

                      ${notification.message}

                    </p>

                  </div>

                  `;

                }
              );

            }
          );

        }

      }
    );

  }

}

loadNotifications();

/* =========================
   ADMIN ANALYTICS
========================= */

function loadAnalytics(){

  /* USERS */

  const totalUsers =
    document.getElementById(
      "totalUsers"
    );

  if(totalUsers){

    onSnapshot(
      collection(
        db,
        "users"
      ),
      (snapshot) => {

        totalUsers.innerText =
          snapshot.size;

      }
    );

  }

  /* TASKS */

  const activeTasks =
    document.getElementById(
      "activeTasks"
    );

  if(activeTasks){

    onSnapshot(
      collection(
        db,
        "tasks"
      ),
      (snapshot) => {

        activeTasks.innerText =
          snapshot.size;

      }
    );

  }

  /* PENDING SUBMISSIONS */

  const pendingSubmissions =
    document.getElementById(
      "pendingSubmissions"
    );

  if(pendingSubmissions){

    const q =
      query(
        collection(
          db,
          "submissions"
        ),
        where(
          "verification",
          "==",
          "Pending"
        )
      );

    onSnapshot(
      q,
      (snapshot) => {

        pendingSubmissions.innerText =
          snapshot.size;

      }
    );

  }

  /* PENDING WITHDRAWALS */

  const pendingWithdrawals =
    document.getElementById(
      "pendingWithdrawals"
    );

  if(pendingWithdrawals){

    const q =
      query(
        collection(
          db,
          "withdrawals"
        ),
        where(
          "status",
          "==",
          "Pending"
        )
      );

    onSnapshot(
      q,
      (snapshot) => {

        pendingWithdrawals.innerText =
          snapshot.size;

      }
    );

  }

}

loadAnalytics();