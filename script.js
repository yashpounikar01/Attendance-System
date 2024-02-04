ddocument.addEventListener('DOMContentLoaded', function () {
    const video = document.getElementById('video');
    const captureButton = document.getElementById('captureButton');
    const capturedImage = document.getElementById('capturedImage');
    const imageInput = document.getElementById('imageInput');

    if (navigator.mediaDevices) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then((stream) => {
                video.srcObject = stream;
            })
            .catch((error) => {
                console.error('Error accessing webcam:', error);
            });
    } else {
        alert('navigator.mediaDevices is not supported in this browser.');
    }

    captureButton.addEventListener('click', function () {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageDataURL = canvas.toDataURL('image/png');

        capturedImage.src = imageDataURL;
        capturedImage.style.display = 'block';

        const byteString = atob(imageDataURL.split(',')[1]);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
            uint8Array[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([arrayBuffer], { type: 'image/png' });

        const formData = new FormData();
        formData.append('image', blob, 'captured-image.png');

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

