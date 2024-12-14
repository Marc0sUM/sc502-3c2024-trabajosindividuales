document.addEventListener('DOMContentLoaded', function () {

    let isEditMode = false;
    let edittingId;
    let tasks = [];
    const API_URL = 'backend/tasks.php';


    async function loadTasks() {
        //Va al backend y trae las tareas
        try {
            const response = await fetch(API_URL, {
                method: 'GET',
                credentials: 'include'
            });
            if (response.ok) {
                tasks = await response.json();
                renderTasks(tasks);
            } else {
                if (response.status === 401) {
                    window.location.href = "index.html";
                }
                console.error('Error trying to get tasks');
            }
        } catch (error) {
            console.error(error);
        }
    }
    //Render tasks = loadTasks
    function renderTasks(tasks) {
        //Traer las tareas del backend
        const taskList = document.getElementById('task-list');
        taskList.innerHTML = '';
        tasks.forEach(function (task) {
            let commentsList = '';
            if (task.comments && task.comments.length > 0) {
                commentsList = '<ul class="list-group list-group-flush">';
                task.comments.forEach(comment => {
                    commentsList += `<li class="list-group-item">${comment.comment} 
                    <button type="button" class="btn btn-sm btn-link remove-comment" data-visitid="${task.id}" data-commentid="${comment.id}">Remove</button>
                    </li>`;
                });
                commentsList += '</ul>';
            }
            const taskCard = document.createElement('div');
            taskCard.className = 'col-md-4 mb-3';
            taskCard.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${task.title}</h5>
                    <p class="card-text">${task.description}</p>
                    <p class="card-text"><small class="text-muted">Due: ${task.due_date}</small> </p>
                    ${commentsList}
                     <button type="button" class="btn btn-sm btn-link add-comment"  data-id="${task.id}">Add Comment</button>

                </div>
                <div class="card-footer d-flex justify-content-between">
                    <button class="btn btn-secondary btn-sm edit-task"data-id="${task.id}">Edit</button>
                    <button class="btn btn-danger btn-sm delete-task" data-id="${task.id}">Delete</button>
                </div>
            </div>
            `;
            taskList.appendChild(taskCard);
        });

        document.querySelectorAll('.edit-task').forEach(function (button) {
            button.addEventListener('click', handleEditTask);
        });

        document.querySelectorAll('.delete-task').forEach(function (button) {
            button.addEventListener('click', handleDeleteTask);
        });

        document.querySelectorAll('.add-comment').forEach(function (button) {
            button.addEventListener('click', function (e) {
                // alert(e.target.dataset.id);
                document.getElementById("comment-task-id").value = e.target.dataset.id;
                const modal = new bootstrap.Modal(document.getElementById("commentModal"));
                modal.show()

            })
        });
        document.querySelectorAll('.remove-comment').forEach(function (button) {
            button.addEventListener('click', function (e) {
                let taskId = parseInt(e.target.dataset.visitid);
                let commentId = parseInt(e.target.dataset.commentid);
                selectedTask = tasks.find(t => t.id === taskId);
                commentIndex = selectedTask.comments.findIndex(c => c.id === commentId);
                selectedTask.comments.splice(commentIndex, 1);
                loadTasks();
            })
        });
    }

    function handleEditTask(event) {
        try {
            // alert(event.target.dataset.id);
            //localizar la tarea quieren editar
            const taskId = parseInt(event.target.dataset.id);
            const task = tasks.find(t => t.id === taskId);
            //cargar los datos en el formulario 
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-desc').value = task.description;
            document.getElementById('due-date').value = task.due_date;
            //ponerlo en modo edicion
            isEditMode = true;
            edittingId = taskId;
            //mostrar el modal
            const modal = new bootstrap.Modal(document.getElementById("taskModal"));
            modal.show();


        } catch (error) {
            alert("Error trying to edit a task");
            console.error(error);
        }
    }


    async function handleDeleteTask(event) {
        // alert(event.target.dataset.id);
        const id = parseInt(event.target.dataset.id);
        const response = await fetch(`${API_URL}?id=${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (response.ok) {
            loadTasks();
        } else {
            console.error('Error trying to delete a task');
        }
    }

    document.getElementById('comment-form').addEventListener('submit', async function (e) {
        e.preventDefault();
        const comment = document.getElementById('task-comment').value;
        const selectedTask = parseInt(document.getElementById('comment-task-id').value);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    task_id: selectedTask,
                    comment: comment
                }),
                credentials: 'include'

            })

            if (response.ok) {
                const data = await response.json();
                console.log(data);
                loadTasks();
            } else {
                console.error('Error trying to add a comment');
            }
        } catch (error) {
            console.error(error);
        }

        const modal = bootstrap.Modal.getInstance(document.getElementById('commentModal'));
        modal.hide();

    })

    document.getElementById('task-form').addEventListener('submit', async function (e) {
        e.preventDefault();

        const title = document.getElementById("task-title").value;
        const description = document.getElementById("task-desc").value;
        const dueDate = document.getElementById("due-date").value;

        if (isEditMode) {

            const response = await fetch(`${API_URL}?id=${edittingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: title,
                    description: description,
                    due_date: dueDate
                }),
                credentials: 'include'
            });
            if (!response.ok) {
                console.error('Error trying to save a task');
            }
        } else {
            const newTask = {
                title: title,
                description: description,
                due_date: dueDate
            };
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newTask),
                credentials: 'include'
            });
            if (!response.ok) {
                console.error('Error trying to save a task');
            }
        }
        const modal = bootstrap.Modal.getInstance(document.getElementById('taskModal'));
        modal.hide();
        loadTasks();
    });

    document.body.addEventListener('click', async function (e) {
        if (e.target.classList.contains('remove-comment')) {
            const commentId = parseInt(e.target.dataset.commentid); 
            try {
                const response = await fetch(`${API_URL}?comment_id=${commentId}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });

                if (response.ok) {
                    loadTasks(); 
                } else {
                    console.error('Error al intentar eliminar el comentario');
                }
            } catch (error) {
                console.error('Error en la solicitud de eliminación', error);
            }
        }
    });
    

    document.getElementById('commentModal').addEventListener('show.bs.modal', function () {
        document.getElementById('comment-form').reset();
    })

    document.getElementById('taskModal').addEventListener('show.bs.modal', function () {
        if (!isEditMode) {
            document.getElementById('task-form').reset();
        }
    });

    document.getElementById("taskModal").addEventListener('hidden.bs.modal', function () {
        edittingId = null;
        isEditMode = false;
    })
    loadTasks();

});