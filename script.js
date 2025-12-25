// API Keys
const IMGBB_API_KEY = "c1f29465e1de3534d7069b0e1a663aee";
const REMOVE_BG_API_KEY = "7ZzNjzXi6JhF69z6c3Qrj9tD";

// DOM Elements
const uploadSection = document.getElementById('uploadSection');
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const selectedFiles = document.getElementById('selectedFiles');
const filesCount = document.getElementById('filesCount');
const filesGrid = document.getElementById('filesGrid');
const processBtn = document.getElementById('processBtn');
const bgColorOptions = document.getElementById('bgColorOptions');
const transparentBtn = document.getElementById('transparentBtn');
const whiteBtn = document.getElementById('whiteBtn');
const customBtn = document.getElementById('customBtn');
const colourPickerSection = document.getElementById('colourPickerSection');
const colourPicker = document.getElementById('colourPicker');
const currentColourBox = document.getElementById('currentColourBox');
const colourHex = document.getElementById('colourHex');
const processingContainer = document.getElementById('processingContainer');
const processingTitle = document.getElementById('processingTitle');
const progressText = document.getElementById('progressText');
const progressPercent = document.getElementById('progressPercent');
const progressFill = document.getElementById('progressFill');
const currentFile = document.getElementById('currentFile');
const currentFileName = document.getElementById('currentFileName');
const resultsContainer = document.getElementById('resultsContainer');
const resultTitle = document.getElementById('resultTitle');
const resultSubtitle = document.getElementById('resultSubtitle');
const summaryStats = document.getElementById('summaryStats');
const linksContainer = document.getElementById('linksContainer');
const linksList = document.getElementById('linksList');
const imagesContainer = document.getElementById('imagesContainer');
const imagesGrid = document.getElementById('imagesGrid');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notificationText');

// State
let selectedAction = null;
let selectedFilesArray = [];
let selectedBgOption = 'transparent';
let selectedBgColor = null;
const MAX_FILES = 20;
let processedResults = [];

// Initialize background options
function initBackgroundOptions() {
    selectBgOption('transparent');
    
    colourPicker.addEventListener('input', function() {
        const hex = this.value.toUpperCase();
        currentColourBox.style.backgroundColor = hex;
        colourHex.textContent = hex;
        selectedBgColor = hex;
    });
}

// Select background option
function selectBgOption(option) {
    selectedBgOption = option;
    
    transparentBtn.classList.remove('active');
    whiteBtn.classList.remove('active');
    customBtn.classList.remove('active');
    
    if (option === 'transparent') {
        transparentBtn.classList.add('active');
        colourPickerSection.style.display = 'none';
        selectedBgColor = null;
        showNotification('খালি ব্যাকগ্রাউন্ড সিলেক্ট করা হয়েছে', 'info');
    } else if (option === 'white') {
        whiteBtn.classList.add('active');
        colourPickerSection.style.display = 'none';
        selectedBgColor = '#FFFFFF';
        showNotification('সাদা ব্যাকগ্রাউন্ড সিলেক্ট করা হয়েছে', 'info');
    } else if (option === 'custom') {
        customBtn.classList.add('active');
        colourPickerSection.style.display = 'block';
        selectedBgColor = '#4361EE';
        colourPicker.value = '#4361ee';
        currentColourBox.style.backgroundColor = '#4361EE';
        colourHex.textContent = '#4361EE';
        showNotification('কাস্টম কালার সিলেক্ট করুন', 'info');
    }
}

// Action Selection
function selectAction(action) {
    if (selectedAction === action) return;
    
    selectedAction = action;
    
    document.getElementById('linkAction').classList.remove('active');
    document.getElementById('bgRemoveAction').classList.remove('active');
    
    if (action === 'link') {
        document.getElementById('linkAction').classList.add('active');
        bgColorOptions.style.display = 'none';
        showNotification('লিঙ্ক তৈরি সিলেক্ট করা হয়েছে', 'info');
    } else if (action === 'bgremove') {
        document.getElementById('bgRemoveAction').classList.add('active');
        bgColorOptions.style.display = 'block';
        initBackgroundOptions();
        showNotification('ব্যাকগ্রাউন্ড রিমুভ সিলেক্ট করা হয়েছে', 'info');
    }
    
    setTimeout(() => {
        uploadSection.style.display = 'block';
        uploadSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
}

// File Upload
uploadArea.addEventListener('click', () => imageInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.background = 'rgba(67, 97, 238, 0.1)';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.background = '';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.background = '';
    
    if (e.dataTransfer.files.length) {
        handleFiles(e.dataTransfer.files);
    }
});

imageInput.addEventListener('change', () => {
    if (imageInput.files.length) {
        handleFiles(imageInput.files);
    }
});

function handleFiles(files) {
    const newFiles = Array.from(files).slice(0, MAX_FILES - selectedFilesArray.length);
    
    if (newFiles.length === 0) {
        showNotification(`সর্বোচ্চ ${MAX_FILES}টি ছবি সিলেক্ট করতে পারেন`, 'error');
        return;
    }
    
    let validFiles = 0;
    
    newFiles.forEach(file => {
        if (!file.type.match('image.*')) {
            showNotification(`${file.name} ছবি ফাইল নয়`, 'error');
            return;
        }
        
        if (file.size > 10 * 1024 * 1024) {
            showNotification(`${file.name} ১০MB এর বেশি`, 'error');
            return;
        }
        
        if (selectedFilesArray.some(f => f.name === file.name && f.size === file.size)) {
            showNotification(`${file.name} ইতিমধ্যে আছে`, 'warning');
            return;
        }
        
        selectedFilesArray.push({
            file: file,
            id: Date.now() + Math.random(),
            preview: null
        });
        validFiles++;
    });
    
    if (validFiles > 0) {
        updateFilesDisplay();
        processBtn.disabled = false;
        showNotification(`${validFiles}টি ছবি সিলেক্ট করা হয়েছে`, 'success');
    }
}

function updateFilesDisplay() {
    filesCount.textContent = `${selectedFilesArray.length}টি ছবি সিলেক্ট করা হয়েছে`;
    
    if (selectedFilesArray.length > 0) {
        selectedFiles.style.display = 'block';
        filesGrid.innerHTML = '';
        
        selectedFilesArray.forEach((fileObj, index) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                fileObj.preview = e.target.result;
                
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                fileItem.innerHTML = `
                    <img class="file-preview" src="${e.target.result}" alt="${fileObj.file.name}">
                    <div class="file-info">
                        <div class="file-name">${fileObj.file.name}</div>
                        <div class="file-size">${formatFileSize(fileObj.file.size)}</div>
                    </div>
                    <div class="remove-file" onclick="removeFile(${index})">
                        <i class="fas fa-times"></i>
                    </div>
                `;
                filesGrid.appendChild(fileItem);
            };
            reader.readAsDataURL(fileObj.file);
        });
    } else {
        selectedFiles.style.display = 'none';
        processBtn.disabled = true;
    }
}

function removeFile(index) {
    selectedFilesArray.splice(index, 1);
    updateFilesDisplay();
    showNotification('ছবি মুছে ফেলা হয়েছে', 'info');
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' বাইট';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
}

// Start Processing
function startProcessing() {
    if (!selectedAction || selectedFilesArray.length === 0) {
        showNotification('প্রথমে অ্যাকশন এবং ছবি সিলেক্ট করুন', 'error');
        return;
    }
    
    uploadSection.style.display = 'none';
    processingContainer.style.display = 'block';
    
    if (selectedAction === 'link') {
        processMultipleLinks();
    } else if (selectedAction === 'bgremove') {
        processMultipleBackgroundRemovals();
    }
    
    processingContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Processing Functions
async function processMultipleLinks() {
    processingTitle.textContent = 'লিঙ্ক তৈরি করা হচ্ছে...';
    processedResults = [];
    let completed = 0;
    let successful = 0;
    
    for (let i = 0; i < selectedFilesArray.length; i++) {
        const fileObj = selectedFilesArray[i];
        
        currentFileName.textContent = fileObj.file.name;
        
        try {
            const formData = new FormData();
            formData.append("image", fileObj.file);
            
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                method: "POST",
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                processedResults.push({
                    name: fileObj.file.name,
                    type: 'link',
                    url: data.data.url,
                    preview: fileObj.preview,
                    size: fileObj.file.size
                });
                successful++;
            }
            
        } catch (error) {
            console.error('Error:', error);
        }
        
        completed++;
        
        const percent = Math.round((completed / selectedFilesArray.length) * 100);
        progressText.textContent = `${completed}টি ছবি প্রসেস করা হয়েছে`;
        progressPercent.textContent = `${percent}%`;
        progressFill.style.width = `${percent}%`;
    }
    
    showLinksResults(successful);
}

async function processMultipleBackgroundRemovals() {
    processingTitle.textContent = 'ব্যাকগ্রাউন্ড সরানো হচ্ছে...';
    processedResults = [];
    let completed = 0;
    let successful = 0;
    
    for (let i = 0; i < selectedFilesArray.length; i++) {
        const fileObj = selectedFilesArray[i];
        
        currentFileName.textContent = fileObj.file.name;
        
        try {
            const formData = new FormData();
            formData.append('image_file', fileObj.file);
            formData.append('size', 'auto');
            formData.append('format', 'png');
            
            const response = await fetch('https://api.remove.bg/v1.0/removebg', {
                method: 'POST',
                headers: {
                    'X-Api-Key': REMOVE_BG_API_KEY
                },
                body: formData
            });
            
            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                
                let processedImageUrl = url;
                
                if (selectedBgOption !== 'transparent') {
                    processedImageUrl = await applyBackgroundColor(blob, selectedBgColor);
                }
                
                processedResults.push({
                    name: fileObj.file.name,
                    type: 'image',
                    url: processedImageUrl,
                    blob: blob,
                    preview: fileObj.preview,
                    originalUrl: url,
                    bgColor: selectedBgColor,
                    bgOption: selectedBgOption,
                    isTransparent: selectedBgOption === 'transparent'
                });
                successful++;
            }
            
        } catch (error) {
            console.error('Error:', error);
        }
        
        completed++;
        
        const percent = Math.round((completed / selectedFilesArray.length) * 100);
        progressText.textContent = `${completed}টি ছবি প্রসেস করা হয়েছে`;
        progressPercent.textContent = `${percent}%`;
        progressFill.style.width = `${percent}%`;
    }
    
    showImagesResults(successful);
}

// Apply background color to transparent image
async function applyBackgroundColor(blob, bgColor) {
    return new Promise((resolve) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.drawImage(img, 0, 0);
            
            const dataUrl = canvas.toDataURL('image/png');
            resolve(dataUrl);
        };
        
        img.src = URL.createObjectURL(blob);
    });
}

// Show Results
function showLinksResults(successful) {
    processingContainer.style.display = 'none';
    resultsContainer.style.display = 'block';
    
    resultTitle.textContent = 'লিঙ্ক তৈরি সম্পূর্ণ!';
    resultSubtitle.textContent = `${successful}টি ছবির লিঙ্ক তৈরি করা হয়েছে`;
    
    summaryStats.innerHTML = `
        <div class="stat-item">
            <div class="stat-number">${selectedFilesArray.length}</div>
            <div class="stat-label">সিলেক্ট করা</div>
        </div>
        <div class="stat-item">
            <div class="stat-number">${successful}</div>
            <div class="stat-label">সফল লিঙ্ক</div>
        </div>
        <div class="stat-item">
            <div class="stat-number">${selectedFilesArray.length - successful}</div>
            <div class="stat-label">ব্যর্থ</div>
        </div>
    `;
    
    linksContainer.style.display = 'block';
    imagesContainer.style.display = 'none';
    
    linksList.innerHTML = '';
    processedResults.forEach((result, index) => {
        const linkItem = document.createElement('div');
        linkItem.className = 'link-item';
        linkItem.innerHTML = `
            <div class="link-header">
                <div class="link-number">${index + 1}</div>
                <img class="link-preview-img" src="${result.preview}" alt="${result.name}" 
                     onclick="window.open('${result.url}', '_blank')" style="cursor: pointer;">
                <div class="link-filename">${result.name}</div>
            </div>
            <div class="link-box">${result.url}</div>
            <div class="link-actions">
                <button class="link-action-btn copy-link-btn" onclick="copyLink('${result.url}')">
                    <i class="fas fa-copy"></i> কপি
                </button>
            </div>
        `;
        linksList.appendChild(linkItem);
    });
    
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showNotification(`${successful}টি ছবির লিঙ্ক তৈরি সফল!`, 'success');
}

function showImagesResults(successful) {
    processingContainer.style.display = 'none';
    resultsContainer.style.display = 'block';
    
    resultTitle.textContent = 'ব্যাকগ্রাউন্ড রিমুভ সম্পূর্ণ!';
    
    let bgInfo = '';
    if (selectedBgOption === 'transparent') {
        bgInfo = 'খালি ব্যাকগ্রাউন্ড';
    } else if (selectedBgOption === 'white') {
        bgInfo = 'সাদা ব্যাকগ্রাউন্ড';
    } else {
        bgInfo = 'কাস্টম কালার';
    }
    
    resultSubtitle.textContent = `${successful}টি ছবির ব্যাকগ্রাউন্ড সরানো হয়েছে`;
    
    summaryStats.innerHTML = `
        <div class="stat-item">
            <div class="stat-number">${selectedFilesArray.length}</div>
            <div class="stat-label">সিলেক্ট করা</div>
        </div>
        <div class="stat-item">
            <div class="stat-number">${successful}</div>
            <div class="stat-label">সফল রিমুভ</div>
        </div>
        <div class="stat-item">
            <div class="stat-number">${selectedFilesArray.length - successful}</div>
            <div class="stat-label">ব্যর্থ</div>
        </div>
    `;
    
    linksContainer.style.display = 'none';
    imagesContainer.style.display = 'block';
    
    imagesGrid.innerHTML = '';
    processedResults.forEach((result, index) => {
        const imageItem = document.createElement('div');
        imageItem.className = 'image-item';
        
        imageItem.innerHTML = `
            <img class="image-preview" src="${result.url}" alt="${result.name}">
            <div class="image-info">
                <div class="image-name">${result.name}</div>
                <div class="image-actions">
                    <button class="image-action-btn download-image-btn" onclick="downloadImage(${index})">
                        <i class="fas fa-download"></i> ডাউনলোড
                    </button>
                </div>
            </div>
        `;
        imagesGrid.appendChild(imageItem);
    });
    
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    showNotification(`${successful}টি ছবির ব্যাকগ্রাউন্ড রিমুভ সফল!`, 'success');
}

// Result Actions
function copyLink(link) {
    navigator.clipboard.writeText(link).then(() => {
        showNotification('লিঙ্ক কপি করা হয়েছে', 'success');
    }).catch(err => {
        showNotification('কপি করা যায়নি', 'error');
    });
}

function copyAllLinks() {
    let allLinks = '';
    processedResults.forEach((result, index) => {
        allLinks += `${index + 1}. ${result.name}\n${result.url}\n\n`;
    });
    
    navigator.clipboard.writeText(allLinks).then(() => {
        showNotification('সব লিঙ্ক কপি করা হয়েছে', 'success');
    }).catch(err => {
        showNotification('কপি করা যায়নি', 'error');
    });
}

function downloadImage(index) {
    const result = processedResults[index];
    if (!result.blob) return;
    
    const link = document.createElement('a');
    link.href = result.url;
    
    let filename = `bg-removed-${result.name.split('.')[0]}.png`;
    if (result.isTransparent) {
        filename = `transparent-${result.name.split('.')[0]}.png`;
    }
    
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('ছবি ডাউনলোড শুরু হয়েছে', 'success');
}

function resetTool() {
    selectedAction = null;
    selectedFilesArray = [];
    selectedBgOption = 'transparent';
    selectedBgColor = null;
    processedResults = [];
    
    document.getElementById('linkAction').classList.remove('active');
    document.getElementById('bgRemoveAction').classList.remove('active');
    
    uploadSection.style.display = 'none';
    selectedFiles.style.display = 'none';
    bgColorOptions.style.display = 'none';
    processingContainer.style.display = 'none';
    resultsContainer.style.display = 'none';
    
    processBtn.disabled = true;
    progressFill.style.width = '0%';
    progressPercent.textContent = '0%';
    imageInput.value = '';
    
    transparentBtn.classList.remove('active');
    whiteBtn.classList.remove('active');
    customBtn.classList.remove('active');
    transparentBtn.classList.add('active');
    colourPickerSection.style.display = 'none';
    
    colourPicker.value = '#4361ee';
    
    processedResults.forEach(result => {
        if (result.type === 'image' && result.url) {
            URL.revokeObjectURL(result.url);
        }
        if (result.originalUrl) {
            URL.revokeObjectURL(result.originalUrl);
        }
    });
    
    showNotification('নতুন ছবি প্রসেস করতে প্রস্তুত', 'info');
}

// Notification
function showNotification(message, type) {
    let icon = 'fas fa-check-circle';
    if (type === 'error') icon = 'fas fa-exclamation-circle';
    if (type === 'warning') icon = 'fas fa-exclamation-triangle';
    if (type === 'info') icon = 'fas fa-info-circle';
    
    notification.innerHTML = `<i class="${icon}"></i><span>${message}</span>`;
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Initialize
window.addEventListener('load', () => {
    showNotification('একসাথে অনেক ছবি প্রসেসিং টুলে স্বাগতম', 'info');
});
