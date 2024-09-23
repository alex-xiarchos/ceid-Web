document.addEventListener('DOMContentLoaded', function() {
    const logged_user = JSON.parse(localStorage.getItem("logged_user"));
    const user_id = logged_user[0].user_id;

    // Haversine formula to calculate the distance between two points on the Earth's surface
    function haversineDistance(lat1, lon1, lat2, lon2) {
        const toRadians = angle => (angle * Math.PI) / 180;

        const R = 6371e3; // Radius of the Earth in meters
        const phi1 = toRadians(lat1);
        const phi2 = toRadians(lat2);
        const deltaPhi = toRadians(lat2 - lat1);
        const deltaLambda = toRadians(lon2 - lon1);

        const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
                  Math.cos(phi1) * Math.cos(phi2) *
                  Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const distance = R * c; // Distance in meters
        return distance;
    }

    // Fetch and display rescuer tasks
    function fetchRescuerTasks() {
        $.ajax({
            url: `./php/rescuer_location.php?user_id=${user_id}`,
            method: 'GET',
            dataType: 'json',
            success: function(data) {
                if (data.length > 0) {
                    displayTasks(data[0], data[0].requests, data[0].offers);
                }
            },
            error: function(xhr, status, error) {
                console.error('Error fetching rescuer location:', error);
            }
        });
    }

    // Display tasks in the task list
    function displayTasks(rescuerData, requests, offers) {
        const taskList = document.getElementById('task-list');
        taskList.innerHTML = ''; // Clear existing tasks

        const rescuerLat = parseFloat(rescuerData.latitude);
        const rescuerLng = parseFloat(rescuerData.longitude);

        requests.forEach(task => {
            if (task.status === 'canceled') {
                return; // Skip canceled tasks
            }

            const taskDiv = document.createElement('div');
            taskDiv.className = 'task bg-gray-800 p-4 rounded-lg mb-4 text-white';
            taskDiv.setAttribute('data-task-id', task.id);

            taskDiv.innerHTML = `
                <p><strong>Task Type:</strong> Request</p>
                <p><strong>Name:</strong> ${task.name}</p>
                <p><strong>Phone:</strong> ${task.phone}</p>
                <p><strong>Date:</strong> ${task.created_at}</p>
                <p><strong>Status:</strong> ${task.status}</p>
                <p><strong>Quantity:</strong> ${task.quantity}</p>
                <p><strong>Item Name:</strong> ${task.item_name}</p>
            `;

            if (task.status === 'completed') {
                taskDiv.innerHTML += `<p class="text-green-600"><strong> Completed!</strong></p>`;
                taskDiv.classList.add("cursor-not-allowed", "opacity-50", "pointer-events-none");
            } else {
                const distance = haversineDistance(
                    rescuerLat, rescuerLng,
                    parseFloat(task.latitude), parseFloat(task.longitude)
                );
    
                if (distance <= 50) {
                    let completeTaskButton = document.createElement('button');
                    completeTaskButton.innerText = "Complete Request";
                    completeTaskButton.className = "complete-task-btn bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded";
                    completeTaskButton.onclick = function() {
                        completeTask(task.id, 'request');
                    };
                    taskDiv.appendChild(completeTaskButton);
                }

                let cancelTaskButton = document.createElement('button');
                cancelTaskButton.innerText = "Cancel Request";
                cancelTaskButton.className = "cancel-request-btn bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded ml-2";
                cancelTaskButton.onclick = function() {
                    cancelTask(task.id, 'request');
                };
                taskDiv.appendChild(cancelTaskButton);
            }

            taskList.appendChild(taskDiv);
        });

        offers.forEach(task => {
            if (task.status === 'canceled') {
                return; // Skip canceled tasks
            }

            const taskDiv = document.createElement('div');
            taskDiv.className = 'task bg-gray-300 p-4 rounded-lg mb-4 text-gray-800';
            taskDiv.setAttribute('data-task-id', task.id);

            taskDiv.innerHTML = `
                <p><strong>Task Type:</strong> Offer</p>
                <p><strong>ID:</strong> ${task.id}</p>
                <p><strong>Name:</strong> ${task.name}</p>
                <p><strong>Phone:</strong> ${task.phone}</p>
                <p><strong>Date:</strong> ${task.created_at}</p>
                <p><strong>Status:</strong> ${task.status}</p>
                <p><strong>Quantity:</strong> ${task.quantity}</p>
                <p><strong>Item Name:</strong> ${task.item_name}</p>
            `;

            if (task.status === 'completed') {
                taskDiv.innerHTML += `<p class="text-green-600"><strong> Completed!</strong></p>`;
                taskDiv.classList.add("cursor-not-allowed", "opacity-50", "pointer-events-none");
            } else if (task.status === 'accepted') {
                    taskDiv.innerHTML += `<p class="text-purple-600"><strong> Offer accepted!</strong></p>`;
                    taskDiv.classList.add("cursor-not-allowed", "pointer-events-none");
            } else {
                const distance = haversineDistance(
                    rescuerLat, rescuerLng,
                    parseFloat(task.latitude), parseFloat(task.longitude)
                );
                console.log(`Task ID: ${task.id}, Task Coordinates: (${task.latitude}, ${task.longitude}), Rescuer Coordinates: (${rescuerLat}, ${rescuerLng}), Distance: ${distance} meters`);

                if (distance <= 50) {
                    let completeTaskButton = document.createElement('button');
                    completeTaskButton.innerText = "Complete Offer";
                    completeTaskButton.className = "complete-task-btn bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded";
                    completeTaskButton.onclick = function() {
                        completeTask(task.id, 'offer');
                    };
                    taskDiv.appendChild(completeTaskButton);
                }

                let cancelTaskButton = document.createElement('button');
                cancelTaskButton.innerText = "Cancel Offer";
                cancelTaskButton.className = "cancel-offer-btn bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded ml-2";
                cancelTaskButton.onclick = function() {
                    cancelTask(task.id, 'offer');
                };
                taskDiv.appendChild(cancelTaskButton);
            }

            taskList.appendChild(taskDiv);
        });
    }

    // Complete a task
    function completeTask(taskId, taskType) {
        const url = taskType === 'offer' ? './php/complete_offer.php' : './php/complete_request.php';
        $.ajax({
            url: url,
            method: 'POST',
            data: { task_id: taskId },
            success: function(response) {
                
                if (response === 1) {
                    Swal.fire("Task completed successfully!", "", "success");
                    fetchRescuerTasks(); // Refresh the task list
                } else if (response === 2) {
                    Swal.fire("Failed to complete the task.", "Not enough items in vehicle cargo.", "error");
                } else if (response === 3) {
                    Swal.fire("Failed to complete the task.", "Item not found in vehicle cargo.", "error");
                } else if (response === 'Request not found.') {
                    Swal.fire("Failed to complete the task.", "Request not found.", "error");
                } else {
                    Swal.fire("Failed to complete the task.", "Unknown error occurred.", "error");
                }
            },
            error: function(xhr, status, error) {
                console.error('Error completing task:', error);
                Swal.fire("Failed to complete the task.", "", "error");
            }
        });
    }
    
    function cancelTask(taskId, taskType) {
        const url = taskType === 'offer' ? './php/cancel_offer.php' : './php/cancel_request.php';
        $.ajax({
            url: url,
            method: 'POST',
            data: { task_id: taskId },
            success: function(response) {
                if (response == 1) {
                    console.log('Task canceled:', response);
                    Swal.fire("Task canceled successfully!", "", "success");
                    fetchRescuerTasks(); // Refresh the task list
                } else {
                    console.log("Failed to cancel the task. Response:", response);
                    Swal.fire("Failed to cancel the task.", "", "error");
                }
            },
            error: function(xhr, status, error) {
                console.error('Error canceling task:', error);
                Swal.fire("Failed to cancel the task.", "", "error");
            }
        });
    }

    fetchRescuerTasks();
});
