document.addEventListener("DOMContentLoaded", function () {
    let editing = false;
    let editingId;
    let tasks = [
        {
            id: 1,
            title: "Complete project report",
            description: "Prepare a project report for the team",
            dueDate: "2024-12-01",
            comments: ["This will be fun", "This could have been a mail"]
        },
        {
            id: 2,
            title: "Team meeting",
            description: "Discuss project goals and timelines",
            dueDate: "2024-12-01",
            comments: ["I can't wait", "I have a conflict at that time"]
        },
        {
            id: 3,
            title: "Code review",
            description: "Review project code and provide feedback",
            dueDate: "2024-12-01",
            comments: []
        },
    ];

    function loadTasks() {
        const taskList = document.getElementById("task-list");
        taskList.innerHTML = "";

        tasks.forEach(task => {
            const taskCard = document.createElement("div");
            taskCard.className = "col-md-4 mb-3";
            taskCard.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${task.title}</h5>
                    <p class="card-text">${task.description}</p>
                    <p class="card-text"><small class="text-muted">Due date: ${task.dueDate}</small></p>

                    <!-- Button para abrir modal -->
                  <button class="btn btn-primary btn-sm add-comment-btn" data-id="${task.id}">Add comment</button>
                  
                    <!-- Lista de comentarios -->
                   <ul class="list-group mt-2">
                   
                    ${task.comments.length > 0
                    ? task.comments.map((comment, index) => `
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            ${comment}
                            <button class="btn btn-danger btn-sm delete-comment-btn" data-task-id="${task.id}" data-comment-index="${index}">Delete</button>
                        </li>`).join('')
                    : '<li class="list-group-item">No comments yet!!</li>'}
                    </ul>

                </div>
                <div class="card-footer d-flex justify-content-between">
                    <button class="btn btn-secondary btn-sm edit-task" data-id="${task.id}">Edit</button>
                    <button class="btn btn-danger btn-sm delete-task" data-id="${task.id}">Delete</button>
                </div>
            </div>
            `;
            taskList.appendChild(taskCard);
        });

        document.querySelectorAll(".edit-task").forEach(button => {
            button.addEventListener("click", handleEditTask);
        });

        document.querySelectorAll(".delete-task").forEach(button => {
            button.addEventListener("click", handleDeleteTask);
        });

        document.querySelectorAll(".add-comment-btn").forEach(button => {
            button.addEventListener("click", handleAddComment);
        });

        document.querySelectorAll(".delete-comment-btn").forEach(button => {
            button.addEventListener("click", handleDeleteComment);
        });
    }

    function handleDeleteComment(event) {
        const taskId = parseInt(event.target.dataset.taskId);
        const commentIndex = parseInt(event.target.dataset.commentIndex);

        const task = tasks.find(task => task.id === taskId);
        if (task) {
            task.comments = task.comments.filter((comment, index) => index !== commentIndex);
            loadTasks();
        }
    }

    function handleAddComment(event) {
        const taskId = parseInt(event.target.dataset.id);
        document.getElementById("comment-task-id").value = taskId;
        const modal = new bootstrap.Modal(document.getElementById('commentModal'));
        modal.show();
    }

    document.getElementById('comment-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const comment = document.getElementById("comment-text").value;
        const taskId = parseInt(document.getElementById("comment-task-id").value);
        const task = tasks.find(task => task.id === taskId);

        if (comment) {
            task.comments.push(comment);
            document.getElementById("comment-text").value = "";
            loadTasks();
            const modal = bootstrap.Modal.getInstance(document.getElementById('commentModal'));
            modal.hide();
        } else {
            console.log('Comment cannot be empty');
        }
    });

    function handleEditTask(event) {
        try {
            //localizar la tarea a editar
            const taskId = parseInt(event.target.dataset.id);
            const task = tasks.find(task => task.id === taskId);
            //cargar los datos en el formulario 
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-desc').value = task.description;
            document.getElementById('due-date').value = task.dueDate;
            //mostrar el modal
            const modal = new bootstrap.Modal(document.getElementById('taskModal'));
            //ponerlo en modo edicion
            editing = true;
            editingId = task.id;
            modal.show();
        } catch (error) {
            console.log(error);
            alert('Error trying to edit task');
        }
    }

    function handleDeleteTask(event) {
        const id = parseInt(event.target.dataset.id);
        tasks = tasks.filter(task => task.id !== id);
        loadTasks();
    }

    document.getElementById('task-form').addEventListener('submit', function (e) {
        e.preventDefault();

        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-desc').value;
        const dueDate = document.getElementById('due-date').value;

        if (editing) {
            const task = tasks.find(task => task.id === editingId);
            task.title = title;
            task.description = description;
            task.dueDate = dueDate;
            editing = false;
        } else {
            const newTask = {
                id: tasks.length + 1,
                title,
                description,
                dueDate,
                comments: []
            };
            tasks.push(newTask);
        }

        const modal = bootstrap.Modal.getInstance(document.getElementById('taskModal'));
        modal.hide();
        document.getElementById('task-form').reset();
        editingId = null;
        editing = false;
        loadTasks();
    });

    loadTasks();
});
