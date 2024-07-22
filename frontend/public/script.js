document.getElementById('registerForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const adminCode = document.getElementById('adminCode').value;

    fetch('https://attendance-system-production.up.railway.app/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, adminCode })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            document.getElementById('auth').style.display = 'none';
            document.getElementById('attendance').style.display = 'block';
        } else {
            alert(data.message);
        }
    })
    .catch(error => console.error('Error:', error));
});

document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    fetch('https://attendance-system-production.up.railway.app/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            document.getElementById('auth').style.display = 'none';
            document.getElementById('attendance').style.display = 'block';
        } else {
            alert(data.message);
        }
    })
    .catch(error => console.error('Error:', error));
});

document.getElementById('attendanceForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const lectureName = document.getElementById('lectureName').value;
    const rollNumbers = document.getElementById('rollNumbers').value;
    const attendanceDate = document.getElementById('attendanceDate').value;

    fetch('https://attendance-system-production.up.railway.app/lecture/mark-attendance', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lectureName, rollNumbers, attendanceDate })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
        } else {
            alert(data.message);
        }
    })
    .catch(error => console.error('Error:', error));
});
