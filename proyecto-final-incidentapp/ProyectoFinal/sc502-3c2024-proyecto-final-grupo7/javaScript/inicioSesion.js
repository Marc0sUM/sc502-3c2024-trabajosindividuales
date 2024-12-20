document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('singIn-form');
    const loginError = document.getElementById('login-error');

    form.addEventListener('submit', async function(e){
        e.preventDefault();

        const userName = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
        //Enviar datos del server
        const url = 'backend/login.php';
        const response = await fetch(url, {
            method: 'POST',
            headers:{
                'content-type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                userName: userName,
                password: password
            })
        })
        //Manejo de la respuesta del server
        const result = response.json();
        if(response.ok){
            window.location.href = 'incidencias.html';
        }else{
            loginError.style.display = 'block';
            loginError.textContent = result.error|| 'Invalid username or password';
        }
        } catch (error) {
            loginError.style.display = 'block';
            loginError.textContent = 'Error sending data to the server';
        }
    })

})