let signupBtn = document.getElementById("signupBtn");
let loginBtn = document.getElementById("loginBtn");
let nameField = document.getElementById("nameField");
let title = document.getElementById("title");

signupBtn.onclick = function () {
  nameField.style.display = "block";
  title.innerText = "Sign Up";
  signupBtn.classList.remove("disable");
  loginBtn.classList.add("disable");
};

loginBtn.onclick = function () {
  nameField.style.display = "none";
  title.innerText = "Log In";
  loginBtn.classList.remove("disable");
  signupBtn.classList.add("disable");
};
