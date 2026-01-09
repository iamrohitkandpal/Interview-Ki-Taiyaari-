const API_URL = "http://localhost:8000/api/gst";

const gstInput = document.getElementById("gstin-input");
const verifyBtn = document.getElementById("verify-btn");
const resultCard = document.getElementById("result-card");
const errorMsg = document.getElementById("error-msg");
const historyList = document.getElementById("history-list");

async function verifyGSTIN() {
    const gstin = gstInput.value.trim();

    if (!gstin) {
        showError("Please enter a GSTIN");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/verify/${gstin}`);

        if (!response.ok) {
            const error = await response.json();
            showError(error.detail || "GSTIN not found");
            return;
        }

        const data = await response.json();
        showResult(data);
        loadHistory();
    } catch (error) {
        showError("Failed to connect to server");
    }
}

function showResult(data) {
    errorMsg.classList.add("hidden");
    resultCard.classList.remove("hidden");

    resultCard.innerHTML = `
        <h3>${data.business_name}</h3>
        <div class="info-row">
            <span class="label">GSTIN:</span>
            <span class="value">${data.gstin}</span>
        </div>

        <div class="info-row">
            <span class="label">Status:</span>
            <span class="value">${data.status == 'Active' ? 'Active' : 'Inactive'}</span>
        </div>

        <div class="info-row">
            <span class="label">State:</span>
            <span class="value">${data.state}</span>
        </div>

        <div class="info-row">
            <span class="label">Type</span>
            <span class="value">${data.taxpayer_type || 'N/A'}</span>
        </div>

        <div class="info-row">
            <span class="label">Address:</span>
            <span class="value">${data.address || 'N/A'}</span>
        </div>
    `;
}

function showError(msg) {
    resultCard.classList.add("hidden");
    errorMsg.classList.remove("hidden");
    errorMsg.textContent = msg;
}

async function loadHistory() {
    try{
        const response = await fetch(`${API_URL}/history`);
        const history = await response.json();

        if(history.length === 0) {
            historyList.innerHTML = "<p style='color:#666'>No search history yet</p>"
            return;
        }

        historyList.innerHTML = history.map(item => `
            <div class="history-item">
                <div class="info">
                    <div class="gstin">${item.gst_in}</div>
                    <div class="name">${item.business_name}</div>
                </div>
                <button class="delete-btn" onclick="deleteHistory(${item.id})">Delete</button>
            </div>
            `
        ).join("");
    }catch(error) {
        console.error("Failed to load history: ", error);
    }
}

async function deleteHistory(id) {
    try {
        await fetch(`${API_URL}/history/${id}`, { method: "DELETE"} );
        loadHistory();
    }catch(error) {
        console.error("Failed to delete history: ", error);
    }
}

verifyBtn.addEventListener("click", verifyGSTIN);
gstInput.addEventListener("keypress", (e) => {
    if(e.key === "Enter") {
        verifyGSTIN();
    }
});

loadHistory();