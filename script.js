function getNovelList() {
    return JSON.parse(localStorage.getItem('novelList') || '[]');
}

function addOrUpdateNovel(title, chapter) {
    if (!title) title = document.getElementById('novelTitle').value;
    if (!chapter) chapter = document.getElementById('novelChapter').value;

    const novelList = getNovelList();
    const novelIndex = novelList.findIndex(novel => novel.title === title);

    if (novelIndex > -1) {
        novelList[novelIndex].chapter = chapter;
    } else {
        novelList.push({ title, chapter });
    }

    localStorage.setItem('novelList', JSON.stringify(novelList));
    displayNovelList();  // Refresh the list display
}

function deleteNovel(title) {
    let novelList = getNovelList();
    novelList = novelList.filter(novel => novel.title !== title);
    localStorage.setItem('novelList', JSON.stringify(novelList));
    displayNovelList();  // Refresh the list display
}

function editNovel(title) {
    const newChapter = prompt(`Update the chapter for ${title}:`);
    if (newChapter) {
        addOrUpdateNovel(title, newChapter);
    }
}

function displayNovelList() {
    const novelList = getNovelList();
    const listContainer = document.getElementById('novelList');
    listContainer.innerHTML = '';

    novelList.forEach(novel => {
        const novelElement = document.createElement('div');
        novelElement.innerHTML = `${novel.title} - Chapter ${novel.chapter} 
                                 <button onclick="editNovel('${novel.title.replace(/'/g, "\\'")}')">Edit</button> 
                                 <button onclick="deleteNovel('${novel.title.replace(/'/g, "\\'")}')">Delete</button>`;
        listContainer.appendChild(novelElement);
    });
}

function loadData() {
    const input = document.getElementById('fileInput');
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const contents = e.target.result;
            const lines = contents.split('\n');
            lines.forEach(line => {
                const lastIndexOfCh = line.lastIndexOf(' ch');
                if (lastIndexOfCh > -1) {
                    const title = line.substring(0, lastIndexOfCh);
                    const chapter = line.substring(lastIndexOfCh + 3); // +3 to skip the space and "ch"
                    if (title && chapter) {
                        addOrUpdateNovel(title.trim(), chapter.trim());
                    }
                }
            });
            
        };
        reader.readAsText(file);
    }
}

function downloadList() {
    const novelList = getNovelList();
    let content = novelList.map(novel => `${novel.title} ch${novel.chapter}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    // Create a link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'novelList.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
