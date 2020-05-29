// let userState = false;

// if (!userState) {
//   document.querySelector("main").style.display = "none";
//   document.querySelector(".loading").innerHTML =
//     "LOADING<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>";
// }
// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyD6-Tn42TFyKyqqkGyRKSBno_X6rpg5n84",
  authDomain: "react-firebase-educative.firebaseapp.com",
  databaseURL: "https://react-firebase-educative.firebaseio.com",
  projectId: "react-firebase-educative",
  storageBucket: "react-firebase-educative.appspot.com",
  messagingSenderId: "683668437584",
  appId: "1:683668437584:web:b4b8ae215fe05f4aaa6f55",
  measurementId: "G-4SG7VH9J5X",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Reference to auth method of Firebase
const auth = firebase.auth();

// Reference to database method of Firebase
const database = firebase.firestore();

const createPost = document.querySelector(".createPost");

// Access the modal element
const modal = document.getElementById("modal");

// Access the element that closes the modal
const close = document.getElementById("close");

// Access the forms for email and password authentication
const createUserForm = document.getElementById("create-user-form");
const signInForm = document.getElementById("sign-in-form");
const forgotPasswordForm = document.getElementById("forgot-password-form");

// Access the authentication dialogs
const createUserDialog = document.getElementById("create-user-dialog");
const signInDialog = document.getElementById("sign-in-dialog");
const haveOrNeedAccountDialog = document.getElementById(
  "have-or-need-account-dialog"
);

// Access elements that need to be hidden or shown based on auth state
const hideWhenSignedIn = document.querySelectorAll(".hide-when-signed-in");
const hideWhenSignedOut = document.querySelectorAll(".hide-when-signed-out");

// Get the to do list form for item submissions
const createPostForm = document.getElementById("create-post-form");

// Access the message HTML element
const authMessage = document.getElementById("message");

// When the user clicks the (x) button close the modal
close.addEventListener("click", () => {
  modal.style.display = "none";
});

// When the user clicks anywhere outside of the modal close it.
window.addEventListener("click", (event) => {
  if (event.target == modal) {
    modal.style.display = "none";
  }
});

let uid;
let userProfile = {};

const addPoststoUI = (posts) => {
  const postContainer = document.getElementById("posts");
  posts.forEach((post) => {
    const article = document.createElement("article");
    article.className = "article";
    article.dataset.name = post.id;
    article.setAttribute("authorId", post.authorId);
    article.innerHTML = `
      <p class="article-details">
        <span>
          <em>${post.authorFirstname} ${post.authorLastname}</em>
        </span>
        <span>
          ${post.createdOn.seconds}
        </span>
      </p>
      <h1 className="title">${post.title}</h1>
      <p>
        ${post.body}
      </p>
    `;
    postContainer.appendChild(article);
  });
};

const removeTweetsFromUI = (id) => {
  document.getElementById(id).remove();
};

const updateTweet = (e) => {};

const deleteTweet = (e) => {
  // console.log(e.target.getAttribute("delete-id"));
  const tweet = e.target;
  const key = e.target.getAttribute("delete-id");
  // Show Loading Visual
  articleLoader("show");
  // Delete fromfirebase
  database
    .collection("tweets")
    .doc(key)
    .delete()
    .then(function () {
      console.log("Document successfully deleted!");
      // Item is removed from DOM based on its ID
      removeTweetsFromUI(key);
      // Remove Loader
      articleLoader("hide");
    })
    .catch(function (error) {
      console.error("Error removing document: ", error);
    });
};

let arr = [];

// Makes your app aware of users
auth.onAuthStateChanged((user) => {
  if (user) {
    // Update user State
    userState = true;
    // Everything inside here happens if user is signed in
    console.log("Uer is Signed In");
    uid = user.uid;
    userProfile.photoURL = user.photoURL;
    // console.log(user);
    // Hide Modal
    modal.style.display = "none";
    // console.log(user.displayName, user.photoURL);
    // Hides or shows elements depending on if user is signed in
    hideWhenSignedIn.forEach((eachItem) => {
      eachItem.classList.add("hide");
    });
    hideWhenSignedOut.forEach((eachItem) => {
      eachItem.classList.remove("hide");
    });

    // Get User Details from users collection
    database.collection("users").onSnapshot((snapshot) => {
      snapshot.forEach((element) => {
        // If Doc ID equals user ID, set userProfile
        if (element.id === uid) {
          userProfile.firstName = element.data().firstName;
          userProfile.lastName = element.data().lastName;
        }
      });
      console.log(userProfile);
    });

    database.collection("tweets").onSnapshot(function (snapshot) {
      const postContainer = document.getElementById("posts");

      snapshot.docChanges().forEach(function (element) {
        if (element.type === "added") {
          console.log(element.doc.id, " => ", element.doc.data());
          const article = document.createElement("article");
          article.className = "article";
          article.id = element.doc.id;
          article.setAttribute("authorId", element.doc.data().authorId);

          // If user ID equals author ID, show delete and update button
          const update = uid === element.doc.data().authorId ? "Update" : "";
          const del = uid === element.doc.data().authorId ? "Delete" : "";

          // Document ID is set as article ID, then set as data-name attribute for Update and Delete Button to make reference easier
          article.innerHTML = `
          <p class="article-details">
            <span>
              <em>
                ${element.doc.data().authorFirstname} ${
            element.doc.data().authorLastname
          }
              </em>
            </span>
            <span>
              ${element.doc.data().createdOn.seconds}
            </span>
          </p>
          <h1 className="title">${element.doc.data().title}</h1>
          <p>
            ${element.doc.data().body}
          </p>
          <p style="display: flex">
            <button update-id="${
              element.doc.id
            }" class="update-tweet-btn">${update}</button>
            <button delete-id="${
              element.doc.id
            }" class="delete-tweet-btn">${del}</button>
          </p>
        `;
          postContainer.appendChild(article);
        }

        // Access all delete and update buttons then add a click listener to them
        const updateBtn = document.querySelectorAll("button.update-tweet-btn");
        const deleteBtn = document.querySelectorAll("button.delete-tweet-btn");

        updateBtn.forEach((button) => (button.onclick = (e) => updateTweet(e)));
        deleteBtn.forEach((button) => (button.onclick = (e) => deleteTweet(e)));

        // updateBtn.onclick = (e) => updateTweet(e);
        // deleteBtn.onclick = (e) => deleteTweet(e);

        if (element.type === "modified") {
          console.log(element.doc.id, " => ", element.doc.data());
        }
        if (element.type === "removed") {
          console.log(element.doc.id, " => ", element.doc.data());
        }
      });
    });
  } else {
    // Everything inside here happens if user is not signed in
    console.log("not signed in");

    userState = null;

    // Hides or shows elements depending on if user is signed out
    hideWhenSignedIn.forEach((eachItem) => {
      eachItem.classList.remove("hide");
    });
    hideWhenSignedOut.forEach((eachItem) => {
      eachItem.classList.add("hide");
    });
  }
});

// Access auth elements to listen for auth actions
const authAction = document.querySelectorAll(".auth");

// Loop through elements and use the associated auth attribute to determine what action to take when clicked
authAction.forEach((eachItem) => {
  eachItem.addEventListener("click", (event) => {
    let chosen = event.target.getAttribute("auth");
    if (chosen === "show-create-user-form") {
      showCreateUserForm();
    } else if (chosen === "show-sign-in-form") {
      showSignInForm();
    } else if (chosen === "show-forgot-password-form") {
      showForgotPasswordForm();
    } else if (chosen === `sign-out`) {
      signOut();
    }
  });
});

// Makes the messageTimeout global so that the clearTimeout method will work when invoked
let messageTimeout;

// Error and message handling
displayMessage = (type, message) => {
  if (type === "error") {
    authMessage.style.borderColor = "red";
    authMessage.style.color = "red";
    authMessage.style.display = "block";
  } else if (type === "success") {
    authMessage.style.borderColor = "green";
    authMessage.style.color = "green";
    authMessage.style.display = "block";
  }

  authMessage.innerHTML = message;
  messageTimeout = setTimeout(() => {
    authMessage.innerHTML = "";
    authMessage.style.display = "none";
  }, 7000);
};

const clearMessage = () => {
  clearTimeout(messageTimeout);
  authMessage.innerHTML = "";
  authMessage.style.display = "none";
};

// Function to hide and show the loading visual cue
const loading = (action) => {
  if (action === "show") {
    document.getElementById("loading-outer-container").style.display = "block";
  } else if (action === "hide") {
    document.getElementById("loading-outer-container").style.display = "none";
  } else {
    console.log("loading error");
  }
};

// Function to hide and show article loading visual cue when deleting or updating
const articleLoader = (action) => {
  if (action === "show") {
    document.getElementById("article-modal").style.display = "flex";
    document.getElementById("article-modal-outer").classList.toggle("hide");
  } else if (action === "hide") {
    document.getElementById("article-modal").style.display = "none";
    document.getElementById("article-modal-outer").classList.toggle("hide");
  } else {
    console.log("loading error");
  }
};

// Invoked at the start of auth functions in order to hide everything before selectively showing the correct form
const hideAuthElements = () => {
  clearMessage();
  loading("hide");
  createUserForm.classList.add("hide");
  signInForm.classList.add("hide");
  forgotPasswordForm.classList.add("hide");
  createUserDialog.classList.add("hide");
  signInDialog.classList.add("hide");
  haveOrNeedAccountDialog.classList.add("hide");
};

// Invoked when user wants to create a new user account
const showCreateUserForm = () => {
  hideAuthElements();
  modal.style.display = "block";
  createUserForm.classList.remove("hide");
  signInDialog.classList.remove("hide");
  haveOrNeedAccountDialog.classList.remove("hide");
};

// Invoked when a user wants to sign in
const showSignInForm = () => {
  hideAuthElements();
  modal.style.display = "block";
  signInForm.classList.remove("hide");
  createUserDialog.classList.remove("hide");
  haveOrNeedAccountDialog.classList.remove("hide");
};

// Invoked when a user wants reset their password
const showForgotPasswordForm = () => {
  hideAuthElements();
  modal.style.display = "block";
  forgotPasswordForm.classList.remove("hide");
};

// Invoked when user wants to sign out
const signOut = () => {
  auth.signOut();
  hideAuthElements();
};

// Create user form submit event
createUserForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loading("show");
  // Grab values from form
  const displayName = document.getElementById("create-user-display-name").value;
  const firstName = document.getElementById("create-user-first-name").value;
  const lastName = document.getElementById("create-user-last-name").value;
  const email = document.getElementById("create-user-email").value;
  const password = document.getElementById("create-user-password").value;
  // Send values to Firebase
  auth
    .createUserWithEmailAndPassword(email, password)
    .then((res) => {
      auth.currentUser.updateProfile({
        displayName: displayName,
      });
      database.collection("users").doc(res.user.uid).set({
        firstName,
        lastName,
      });
      createUserForm.reset();
    })
    .catch((error) => {
      displayMessage("error", error.message);
      loading("hide");
    });
});

// Sign in form submit event
signInForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loading("show");
  // Grab values from form
  const email = document.getElementById("sign-in-email").value;
  const password = document.getElementById("sign-in-password").value;
  // Send values to Firebase
  auth
    .signInWithEmailAndPassword(email, password)
    .then(() => {
      signInForm.reset();
      hideAuthElements();
    })
    .catch((error) => {
      displayMessage("error", error.message);
      loading("hide");
    });
});

// Forgot password form submit event
forgotPasswordForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loading("show");
  // Grab value from form
  var emailAddress = document.getElementById("forgot-password-email").value;
  // Send value to Firebase
  firebase
    .auth()
    .sendPasswordResetEmail(emailAddress)
    .then(() => {
      forgotPasswordForm.reset();
      displayMessage("success", "Message sent. Please check your email");
    })
    .catch((error) => {
      displayMessage("error", error.message);
      loading("hide");
    });
});

// Add to-do item submit event
createPostForm.addEventListener("submit", (event) => {
  event.preventDefault();
  // Send value to Firebase
  database
    .collection("tweets")
    .add({
      title: document.getElementById("title").value,
      body: document.getElementById("body").value,
      authorFirstname: userProfile.firstName,
      authorLastname: userProfile.lastName,
      authorId: uid,
      createdOn: new Date(),
    })
    .then(function (docRef) {
      console.log(docRef);
      console.log("Document written with ID: ", docRef.id);
    })
    .catch(function (error) {
      console.error("Error adding document: ", error);
    });

  // reset form
  createPostForm.reset();
  showLatestPosts();
});

createPost.addEventListener("click", showCreatePost);

const latestPosts = document.querySelector(".latest-posts");
const addPostForm = document.querySelector(".add-post-form");

function showCreatePost() {
  if (latestPosts.style.display === "block") {
    displayAddPostForm();
  } else {
    showLatestPosts();
  }
}

function displayAddPostForm() {
  latestPosts.style.display = "none";
  addPostForm.style.display = "block";
}

function showLatestPosts() {
  latestPosts.style.display = "block";
  addPostForm.style.display = "none";
}
