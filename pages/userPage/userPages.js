
document.addEventListener('DOMContentLoaded', function() {
    // Counter for tracking file input fields
    let fileInputCounter = 1;

    // Function to add another file input field
    function addFileInput() {
        fileInputCounter++; // Increment counter
        const fileInputsDiv = document.getElementById('fileInputs');

        // Create new file input field
        const newFileInput = document.createElement('div');
        newFileInput.classList.add('form-group');
        newFileInput.innerHTML = `
            <label for="file${fileInputCounter}">Upload File</label>
            <div class="custom-file">
                <input type="file" class="custom-file-input" id="file${fileInputCounter}" name="file${fileInputCounter}">
                <label class="custom-file-label" for="file${fileInputCounter}">Choose file</label>
            </div>
        `;
        fileInputsDiv.appendChild(newFileInput);
    }

    // Event listener for the add file input button
    document.getElementById('addFileInput').addEventListener('click', addFileInput);
});