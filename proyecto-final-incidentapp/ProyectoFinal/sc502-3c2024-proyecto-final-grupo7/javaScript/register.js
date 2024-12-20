    document.addEventListener('DOMContentLoaded', function() {

        const registerForm = document.getElementById('signup-form');
        const registerError = document.getElementById('register-error');

        registerForm.addEventListener('submit', async function(e){
            e.preventDefault();

            const userName = document.getElementById('username').value;
            const correo = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const errorMsg = "Passwords do not match";

            if(password !== confirmPassword){   
                registerError.innerHTML = `<div class="alert alert-danger fade show" role="alert">${errorMsg}</div>`;
                return;
            }else{
                //Preparar datos para enviar
                const formData = new URLSearchParams();
                formData.append('userName', userName);
                formData.append('password', password);
                formData.append('correo', correo);
                try {
                    //Enviar datos del server
                    const response = await fetch('/backend/register.php', {
                        method: 'POST',
                        headers:{
                            'content-type': 'application/x-www-form-urlencoded'
                        },
                        body: formData.toString()
                });
                
                if(response.ok){
                    registerError.innerHTML = `<div class="alert alert-success fade show" role="alert"><strong>Success!
                    </strong> Username: ${userName} successfully registered</div>`;
                    setTimeout(function(){
                        registerError.innerHTML = '';
                        window.location.href = 'index.html';
                    },5000);
                }else{
                    registerError.innerHTML = `<div class="alert alert-danger fade show" role="alert">
                    <strong>Error sending data to the server</strong></div>`;
                }
                } catch (error) {
                    console.error('Error:', error);
                    registerError.innerHTML = `<div class="alert alert-danger fade show" role="alert">
                    <strong>Error sending data to the server</strong></div>`;
                }
            }

        })

    })