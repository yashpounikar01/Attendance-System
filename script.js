document.addEventListener('DOMContentLoaded', function () {
    const video = document.getElementById('video');
    const captureButton = document.getElementById('captureButton');
    const capturedImage = document.getElementById('capturedImage');
    const imageInput = document.getElementById('imageInput');

    // Check if the browser supports navigator.mediaDevices
    if (navigator.mediaDevices) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                video.srcObject = stream;
            })
            .catch((error) => {
                console.error('Error accessing webcam:', error);
            });
    } else {
        alert('navigator.mediaDevices is not supported in this browser.');
    }

    // Handle the button click to capture attendance
    captureButton.addEventListener('click', function () {
        // Capture a frame from the video
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert the frame to a data URL
        const imageDataURL = canvas.toDataURL('image/png');

        // Display the captured image on the page
        capturedImage.src = imageDataURL;
        capturedImage.style.display = 'block';

        // Convert the data URL to a Blob
        const byteString = atob(imageDataURL.split(',')[1]);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
            uint8Array[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([arrayBuffer], { type: 'image/png' });

        // Create a FormData object and append the Blob
        const formData = new FormData();
        formData.append('image', blob, 'captured-image.png');

        // Send the image to the server using fetch (adjust the URL accordingly)
        fetch('/upload', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.text())
        .then(message => {
            console.log(message);
            alert('Attendance captured and image uploaded!');
        })
        .catch(error => {
            console.error('Error uploading image:', error);
            alert('Error uploading image. Please try again.');
        });
    });

    // Handle image input change (for testing file upload)
    imageInput.addEventListener('change', function () {
        const file = imageInput.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = function (e) {
                capturedImage.src = e.target.result;
                capturedImage.style.display = 'block';

                const formData = new FormData();
                formData.append('image', file, 'selected-image.png');

                fetch('/upload', {
                    method: 'POST',
                    body: formData,
                })
                .then(response => response.text())
                .then(message => {
                    console.log(message);
                    alert('Image uploaded!');
                })
                .catch(error => {
                    console.error('Error uploading image:', error);
                    alert('Error uploading image. Please try again.');
                });
            };

            reader.readAsDataURL(file);
        }
    });
});
