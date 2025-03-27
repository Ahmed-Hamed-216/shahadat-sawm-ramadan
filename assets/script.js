async function generateImage() {
    const name = document.getElementById("name-input").value.trim();
    const imageInput = document.getElementById("image-input");
    const selectedImage = imageInput.value;
    const resultSection = document.getElementById("result-section");
    const loadingElement = document.getElementById("loading");
    const resultElement = document.getElementById("result");
    const downloadLink = document.getElementById("download-link");
    const generatedImage = document.getElementById("generated-image");
    const successMessage = document.createElement('div');
    successMessage.className = 'alert alert-success';
    resultElement.prepend(successMessage);

    // إخفاء الرسائل السابقة
    document.querySelectorAll('.alert').forEach(alert => {
        alert.style.display = 'none';
    });

    // Validate input
    if (!name) {
        showError("الرجاء إدخال اسم الطفل", 'danger');
        return;
    }

    if (!selectedImage || selectedImage === "") {
        showError("الرجاء اختيار نوع الشهادة", 'danger');
        return;
    }

    // Show loading state
    loadingElement.style.display = "flex";
    resultSection.style.display = "none";
    document.getElementById("name-input").blur();

    try {
        // Load the image
        const image = await loadImage(selectedImage);
        
        // Create canvas and draw
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");
        
        // Draw the base image
        ctx.drawImage(image, 0, 0);
        
        // Set text styles for name
        ctx.font = "bold 130px 'Tajawal', sans-serif";
        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // Draw the name (position adjusted for better placement)
        ctx.fillText(name, canvas.width / 2, canvas.height / 2.16);
        
        // Get current date
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        const formattedDate = `${dd}-${mm}-${yyyy}`;
        
        // Set text styles for date
        ctx.font = "bold 80px 'Tajawal', sans-serif";
        ctx.textAlign = "right";
        
        // Draw the date (position adjusted for better placement)
        ctx.fillText(formattedDate, canvas.width / 4.5, canvas.height * 0.875);
        
        // Convert to data URL
        const dataURL = canvas.toDataURL("image/jpeg", 0.8);
        const fileName = `شهادة_تقدير_${name}.jpg`;
        
        // Display the result
        generatedImage.src = dataURL;
        downloadLink.href = dataURL;
        downloadLink.setAttribute("download", fileName);
        
        // Set success message
        successMessage.textContent = `تم إنشاء شهادة تقدير لـ ${name} بنجاح!`;
        successMessage.style.display = "block";
        
        // Set up share button
        document.getElementById("share-btn").onclick = () => shareCertificate(name, dataURL);
        
        // Hide loading and show result
        loadingElement.style.display = "none";
        resultSection.style.display = "block";
        resultElement.style.display = "block";
        
        // Scroll to result
        resultSection.scrollIntoView({ behavior: "smooth" });
        
    } catch (error) {
        console.error("Error generating image:", error);
        loadingElement.style.display = "none";
        showError("حدث خطأ أثناء إنشاء الشهادة. الرجاء المحاولة مرة أخرى.", 'danger');
    }
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = "Anonymous";
        image.src = src;
        image.onload = () => resolve(image);
        image.onerror = (error) => reject(error);
    });
}

function showError(message, type = 'danger') {
    const errorElement = document.createElement("div");
    errorElement.className = `alert alert-${type}`;
    errorElement.textContent = message;
    
    const inputSection = document.querySelector(".input-section");
    const existingAlert = inputSection.querySelector(".alert");
    
    if (existingAlert) {
        inputSection.replaceChild(errorElement, existingAlert);
    } else {
        inputSection.insertBefore(errorElement, inputSection.firstChild);
    }
    
    errorElement.style.display = 'block';
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        errorElement.classList.add("fade-out");
        setTimeout(() => errorElement.remove(), 300);
    }, 5000);
}

function shareCertificate(name, imageUrl) {
    const shareText = `تم إنشاء شهادة تقدير لـ ${name} بمناسبة صيام شهر رمضان المبارك\n\nأنشئ شهادة لطفلك أيضًا من خلال:\n${window.location.href}`;
    
    if (navigator.share) {
        navigator.share({
            title: `شهادة تقدير لـ ${name}`,
            text: shareText,
            url: window.location.href
        }).catch(err => {
            console.log('Error sharing:', err);
            fallbackShare(shareText);
        });
    } else {
        fallbackShare(shareText);
    }
}

function fallbackShare(text) {
    navigator.clipboard.writeText(text).then(() => {
        showError("تم نسخ رابط المشاركة إلى الحافظة!", 'info');
    }).catch(err => {
        console.error('Could not copy text: ', err);
        showError("يمكنك مشاركة الرابط يدويًا: " + text, 'info');
    });
}

// Add event listener for Enter key
document.getElementById("name-input").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        generateImage();
    }
});

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();
    
    // Add fade-out animation for alerts
    const style = document.createElement('style');
    style.textContent = `
        .fade-out {
            opacity: 0;
            transition: opacity 0.3s ease-out;
        }
    `;
    document.head.appendChild(style);
});