document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("registerForm");
    const error = document.getElementById("register_error");

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if( password !== confirmPassword) {
            error.innerHTML = `<div class="alert alert-danger fade show " role="alert" >
            <strong>Error!</strong> Password and confirmation don't match
            </div>`;
            setTimeout(() => {
                error.style.display = 'none';
            }, 3000);
            return
        }else{
            error.innerHTML = `<div class="alert alert-success fade show " role="alert" >
            <strong>Success!</strong> Email: ${email} successfully registered
            </div>`;
            setTimeout(() => {
                error.style.display = 'none';
                window.location.href = "index.html";
            }, 3000);   
        }
    })
})