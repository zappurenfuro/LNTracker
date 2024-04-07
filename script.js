const fileInput = document.getElementById('fileInput');
const loadBtn = document.getElementById('loadBtn');
const sortBtn = document.getElementById('sortBtn');
const downloadBtn = document.getElementById('downloadBtn');
const backupBtn = document.getElementById('backupBtn');
const novelList = document.getElementById('novelList');
const newEntryInput = document.getElementById('newEntryInput');
const addEntryBtn = document.getElementById('addEntryBtn');

let novelData = [];
let sortOrder = 'default';

// Load novel list from .txt file
loadBtn.addEventListener('click', () => {
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            novelData = reader.result.trim().split('\n');
            updateNovelList();
            saveToLocalStorage();
        };
        reader.readAsText(file);
    }
});

// Sort novel list
sortBtn.addEventListener('click', () => {
    if (sortOrder === 'default') {
        novelData.sort((a, b) => {
            const aUpdated = a.split(' ch')[0].includes('<span style="color:white">');
            const bUpdated = b.split(' ch')[0].includes('<span style="color:white">');
            if (aUpdated && !bUpdated) return -1;
            if (!aUpdated && bUpdated) return 1;
            return a.localeCompare(b);
        });
        sortOrder = 'recently-updated';
    } else {
        novelData.sort((a, b) => a.localeCompare(b));
        sortOrder = 'alphabetical';
    }
    updateNovelList();
    saveToLocalStorage();
});

// Download novel list as .txt file
downloadBtn.addEventListener('click', () => {
    const novelListText = novelData.join('\n');
    const blob = new Blob([novelListText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'novel_list.txt';
    link.click();
});

// Update novel list display
function updateNovelList() {
    novelList.innerHTML = '';
    novelData.forEach((novel, index) => {
        const li = document.createElement('li');
        const novelText = document.createElement('span');
        novelText.innerHTML = novel;
        li.appendChild(novelText);

        const btnGroup = document.createElement('div');
        btnGroup.classList.add('btn-group');

        const updateBtn = document.createElement('button');
        updateBtn.textContent = 'Update';
        updateBtn.classList.add('btn');
        updateBtn.addEventListener('click', () => {
            const newChapter = prompt('Enter the new chapter number:', novel.split(' ch')[1]);
            if (newChapter !== null) {
                const updatedNovel = `<span style="color:white; font-weight: bold;">${novel.split(' ch')[0]}</span> ch${newChapter}`;
                novelData[index] = updatedNovel;
                updateNovelList();
                saveToLocalStorage();
            }
        });
        btnGroup.appendChild(updateBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.add('btn');
        deleteBtn.addEventListener('click', () => {
            novelData.splice(index, 1);
            updateNovelList();
            saveToLocalStorage();
        });
        btnGroup.appendChild(deleteBtn);

        li.appendChild(btnGroup);

        novelList.appendChild(li);
    });
}

// Save novel list to local storage
function saveToLocalStorage() {
    localStorage.setItem('novelData', JSON.stringify(novelData));
}

// Load novel list from local storage
const storedData = JSON.parse(localStorage.getItem('novelData'));
if (storedData) {
    novelData = storedData;
    updateNovelList();
}

// Add new entry
addEntryBtn.addEventListener('click', () => {
    const newEntry = newEntryInput.value.trim();
    if (newEntry) {
        novelData.push(`${newEntry} ch1`);
        newEntryInput.value = '';
        updateNovelList();
        saveToLocalStorage();
    }
});

// Backup novel list
backupBtn.addEventListener('click', () => {
    const formattedNovelList = novelData.map(entry => {
        const parts = entry.split(' ch');
        if (parts.length === 2) {
            return { title: parts[0], chapter: parts[1] };
        }
        return null; // Or handle this case differently if needed
    }).filter(entry => entry !== null);

    fetch('https://lntracker.onrender.com/send-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ novelList: formattedNovelList }),
    })
        .then(response => {
            if (!response.ok) {
                // If the server response was not ok, throw an error
                throw new Error('Network response was not ok');
            }
            return response.json(); // We can safely parse the response as JSON
        })
        .then(data => {
            if (data.message) {
                alert(data.message); // Alert with the message from the server
            } else {
                throw new Error('Unexpected response from the server');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('An error occurred while sending the backup email.');
        });
});
