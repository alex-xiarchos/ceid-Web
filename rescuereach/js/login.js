$('#login').on('keydown', function(e) {
  if (e.key === 'Enter' || e.keyCode === 13) {
      e.preventDefault(); 
      login(); 
  }
});

function login() {
  const username = $("#username").val();
  const password = $("#password").val();

  if (!username || !password) {
    showAlert("Please provide both your username and password.");
    return;
  }

  $.ajax({
    url: "./php/login.php",
    method: "POST",
    data: { username, password },
    success: handleSuccess,
    error: function () {
      showError("An unexpected error occurred.");
    }
  });
}

function handleSuccess(result) {
  if (typeof result === "object") {
    localStorage.setItem("logged_user", JSON.stringify(result));

    const Toast = Swal.mixin({
      toast: true,
      showConfirmButton: false,
      timer: 1000,
      background: '#212936',
    });

    Toast.fire({
      icon: 'success',
      title: 'Successful login!'
    });

    const logged_user = JSON.parse(localStorage.getItem("logged_user"));
    let redirectURL = "index.html"; 

    if (logged_user && logged_user[0]) {
      const user_type = logged_user[0].user_type;
      if (user_type == "a") {
        redirectURL = "admin.html";
      } else if (user_type == "r") {
        redirectURL = "rescuer.html";
      } else if (user_type == "c") {
        redirectURL = "user.html";
      }
    }

    // Adding a delay of 2 seconds before redirecting
    setTimeout(() => {
      window.location.assign(redirectURL);
    }, 1000);
  } else if (result == "2") {
    showError("Invalid username or password.");
  } else {
    showError("An unexpected error occurred.");
  }
}


function showAlert(message) {
  Swal.fire({
    icon: "warning",
    title: message,
  });
}

function showError(message) {
  Swal.fire({
    icon: "error",
    title: message,
  });
}
