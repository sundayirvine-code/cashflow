// Function to display a success message
function displaySuccessMessage(message) {
    const successMessage = document.getElementById('successMessage');
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    successMessage.style.opacity = '1';
  
    // Use setTimeout to hide the message after a delay
    setTimeout(() => {
      // Set the opacity to 0 for fading out
      successMessage.style.opacity = '0';
  
      // After the transition completes (0.5 seconds), hide the message
      setTimeout(() => {
        successMessage.style.display = 'none';
      }, 500);
    }, 2000);
  }

// Handle edit transaction button click
let transactionId = 0;
let categoryId = 0;
let categoryName = '';
let amount = 0;
document.querySelectorAll('.edit-transaction').forEach(editButton => {
    editButton.addEventListener('click', () => {
        // Extract data attributes from the edit icon
        transactionId = editButton.getAttribute('data-transaction-id');
        const description = editButton.getAttribute('data-description');
        amount = editButton.getAttribute('data-amount');
        const date = editButton.getAttribute('data-date');
        categoryId = editButton.getAttribute('data-categoryId'); 
        categoryName = editButton.getAttribute('data-categoryname');

        console.log('Originals:', transactionId, description, amount, date, categoryId, categoryName);

        // Populate the edit form with data from the row
        document.getElementById('Editdate').value = date;
        document.getElementById('Editamount').value = parseFloat(amount.replace(/,|\/=|\s/g, ''));
        document.getElementById('Editdescription').value = description;


        // Display the edit form
        document.getElementById('modal-edit').style.display = 'block';
    });
});

// Handle edit form submission
document.getElementById('submitEditTransactionForm').addEventListener('click', () => {
    // Collect data from the edit form
    const newDate = document.getElementById('Editdate').value;
    const newAmount = parseFloat(document.getElementById('Editamount').value); // Parse as a float
    const newDescription = document.getElementById('Editdescription').value;

    console.log('Edits:', newDate, newAmount, newDescription);

    // Perform data validations
    if (!newDate || !newAmount) {
        // Required fields are missing, display an error message
        alert('Please fill in all required fields.');
        return; // Stop further execution
    }

    if (new Date(newDate) > new Date()) {
        // Date is in the future, display an error message
        alert('Please select a date that is not in the future.');
        return; // Stop further execution
    }

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // Months are 0-based, so add 1 to get the current month
    console.log(currentYear, currentMonth);
    const dateParts = newDate.split(" ")[0].split("-");
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]);
    

    if (year !== currentYear || month !== currentMonth) {
        // Date is not in the current month and year, display an error message
        alert('Please select a date within the current month and year.');
        return; // Stop further execution
    }

    if (newAmount < 0) {
        // Amount is negative, display an error message
        alert('Please enter a non-negative amount.');
        return; // Stop further execution
    }

    if (newDescription.length > 100) {
        // Description is too long, display an error message
        alert('Description should not exceed 100 characters.');
        return; // Stop further execution
    }
    console.log(newAmount, parseFloat(amount.replace(/,|\/=|\s/g, '')))
    // Construct a JSON object with the data
    const data = {
        transaction_id: transactionId,
        new_date: newDate,
        new_amount: newAmount,
        new_description: newDescription,
        expense_id: categoryId,
        amount_diff: (newAmount - parseFloat(amount.replace(/,|\/=|\s/g, '')))
    };

    // Send a POST request to the edit route
    fetch('/edit_expense_transaction', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (response.ok) {
            // Transaction updated successfully
            response.json().then(data => {
                console.log('Response from server:', data);
                // Access specific data fields from the JSON response, e.g., edited_transaction
                const editedTransaction = data.edited_transaction;
                console.log('Edited Transaction:', editedTransaction);

                // Find the table row with the corresponding transaction_id
                const tableRow = document.querySelector(`tr[data-row-id="${editedTransaction.transaction_id}"]`);

                if (tableRow) {
                    // Update the table row data with the new data
                    tableRow.querySelector('td:nth-child(3)').textContent = editedTransaction.new_description;   // Column 3 (Description)
                    tableRow.querySelector('td:nth-child(4)').textContent = editedTransaction.new_date;          // Column 4 (Date)
                    tableRow.querySelector('td:nth-child(5)').textContent = editedTransaction.new_amount;        // Column 5 (Amount)

                    // Update data attributes of edit and delete icons
                    const editIcon = tableRow.querySelector('.edit-transaction');
                    const deleteIcon = tableRow.querySelector('.delete-transaction');
                    
                    editIcon.setAttribute('data-description', editedTransaction.new_description);
                    editIcon.setAttribute('data-date', editedTransaction.new_date);
                    editIcon.setAttribute('data-amount', editedTransaction.new_amount);

                    // Hide the edit form
                    document.getElementById('modal-edit').style.display = 'none';

                    displaySuccessMessage(data.message)
                }
            });         
        } else {
           // Handle errors and display an error message
            response.json().then(errorData => {
                console.error('Error from server:', errorData);
            });
        }
    });

    // Hide the edit form
    document.getElementById('modal-edit').style.display = 'none';
});

// Handle cancel edit button click
document.getElementById('cancelEditTransaction').addEventListener('click', () => {
    // Hide the edit form
    document.getElementById('modal-edit').style.display = 'none';
});

// Handle delete transaction button click
document.querySelectorAll('.delete-transaction').forEach(deleteButton => {
    deleteButton.addEventListener('click', () => {
        // Extract data attributes from the delete icon
        const transactionId = deleteButton.getAttribute('data-transaction-id');

        // Display a confirmation modal for deletion
        document.getElementById('modal-delete').style.display = 'block';

        // Add an event listener for the delete button in the modal
        document.getElementById('modal-content-delete').addEventListener('click', () => {
            // Send a POST request to the delete route
            fetch('/delete_expense_transaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ transaction_id: transactionId }),
            })
            .then(response => {
                if (response.ok) {
                    // Transaction deleted successfully
                    response.json().then(data => {
                        // Find the table row with the corresponding transaction_id
                        const tableRow = document.querySelector(`tr[data-row-id="${transactionId}"]`);
                        // Add the 'fadeOut' class to initiate the animation
                        tableRow.classList.add('fadeOut');
                        // Wait for the animation to complete (0.5s in this example)
                        setTimeout(() => {
                            tableRow.classList.remove('fadeOut');
                            const tableBody = document.getElementById('transactionTableBody');
                            tableBody.removeChild(tableRow);
                        }, 900);
                        // Hide the delete modal
                        document.getElementById('modal-delete').style.display = 'none';
                        // Display a success message
                        displaySuccessMessage(data.message);
                    })
                } else {
                    // Handle errors and display an error message
                }
            });

            // Hide the confirmation modal
            document.getElementById('modal-delete').style.display = 'none';
        });
    });
});

// Handle cancel delete button click
document.getElementById('modal-content-cancel').addEventListener('click', () => {
    // Hide the delete confirmation modal
    document.getElementById('modal-delete').style.display = 'none';
});
