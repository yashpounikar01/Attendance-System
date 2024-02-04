document.addEventListener('DOMContentLoaded', async function () {
    const video = document.getElementById('video');
    const captureButton = document.getElementById('captureButton');
    const capturedImage = document.getElementById('capturedImage');
    const imageInput = document.getElementById('imageInput');

    async function loadModels() {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    }

    async function startFaceDetection(videoElement) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            video.srcObject = stream;

            await new Promise(resolve => {
                video.addEventListener('loadeddata', resolve);
            });

            const canvas = faceapi.createCanvasFromMedia(videoElement);
            document.body.append(canvas);

            const displaySize = { width: videoElement.width, height: videoElement.height };
            faceapi.matchDimensions(canvas, displaySize);

            setInterval(async () => {
                const detections = await faceapi.detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();

                const resizedDetections = faceapi.resizeResults(detections, displaySize);
                canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
                faceapi.draw.drawDetections(canvas, resizedDetections);

                // Draw a red box around each detected face
                resizedDetections.forEach((detection) => {
                    const box = detection.detection.box;
                    const drawBox = new faceapi.draw.DrawBox(box, { label: 'Face' });
                    drawBox.draw(canvas);
                });
            }, 100);
        } catch (error) {
            console.error('Error accessing webcam:', error);
            alert('Error accessing webcam. Please check permissions and try again.');
        }
    }

    // Load face detection models before starting face detection
    await loadModels();

    // Start face detection after models are loaded
    await startFaceDetection(video);
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

    // Start face detection after DOMContentLoaded
    await startFaceDetection(video);
});
