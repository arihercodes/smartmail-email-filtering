console.log("SmartMail ML content script loaded");

const API_URL = "http://127.0.0.1:8000/predict";


// ==================================================
// CATEGORY COLORS
// ==================================================

const categoryColors = {

    Career: {
        background: "#E8DEF8",
        text: "#6A1B9A"
    },

    Education: {
        background: "#D6E4FF",
        text: "#174EA6"
    },

    Finance: {
        background: "#D9F2D9",
        text: "#137333"
    },

    Newsletter: {
        background: "#CCF2F4",
        text: "#00695C"
    },

    Other: {
        background: "#E8EAED",
        text: "#5F6368"
    },

    Promotion: {
        background: "#FFE0B2",
        text: "#E65100"
    },

    Security: {
        background: "#FFD6D6",
        text: "#B71C1C"
    },

    Shopping: {
        background: "#FFF0B3",
        text: "#7A5C00"
    },

    Social: {
        background: "#F8D7E6",
        text: "#AD1457"
    }

};


// ==================================================
// CLASSIFY EMAIL USING ML MODEL
// ==================================================

async function classifyWithML(subject, sender, preview) {

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                subject: subject,

                body: `From: ${sender}\n${preview}`

            })

        });


        if (!response.ok) {

            throw new Error(
                `API returned ${response.status}`
            );

        }


        const result = await response.json();


        return result;

    }

    catch (error) {

        console.error(
            "SmartMail ML API error:",
            error
        );

        return null;
    }

}


// ==================================================
// ADD CATEGORY LABEL TO GMAIL
// ==================================================

function addLabel(row, category, confidence) {

    // Prevent duplicate labels
    if (row.querySelector(".smartmail-label")) {
        return;
    }


    const label = document.createElement("span");

    label.className = "smartmail-label";


    // Category text
    label.textContent =
        category.toUpperCase();


    // Tooltip
    label.title =
        `SmartMail prediction: ${category} (${Math.round(confidence * 100)}% confidence)`;


    // Get category colors
    const colors =
        categoryColors[category] ||
        categoryColors.Other;


    // ==================================================
    // LABEL STYLE
    // ==================================================

    label.style.display = "inline-block";

    label.style.marginRight = "10px";

    label.style.padding = "3px 8px";

    label.style.borderRadius = "12px";

    label.style.fontSize = "10px";

    label.style.fontWeight = "700";

    label.style.fontFamily =
        "Arial, sans-serif";

    label.style.letterSpacing =
        "0.3px";

    label.style.backgroundColor =
        colors.background;

    label.style.color =
        colors.text;

    label.style.verticalAlign =
        "middle";

    label.style.whiteSpace =
        "nowrap";

    label.style.lineHeight =
        "14px";


    // ==================================================
    // PUT LABEL FIRST
    // ==================================================

    const senderElement =
        row.querySelector(".yW");


    if (senderElement) {

        senderElement.parentElement.insertBefore(
            label,
            senderElement
        );

    }

}


// ==================================================
// SCAN GMAIL INBOX
// ==================================================

async function scanInboxWithML() {

    const rows =
        document.querySelectorAll("tr.zA");


    console.log(
        `SmartMail found ${rows.length} email rows`
    );


    for (const row of rows) {

        // ----------------------------------------------
        // Skip already processed emails
        // ----------------------------------------------

        if (
            row.dataset.smartmailProcessed === "true"
        ) {

            continue;

        }


        // ----------------------------------------------
        // Find sender
        // ----------------------------------------------

        const senderElement =
            row.querySelector(".yX span[email]") ||
            row.querySelector(".yW span[email]");


        // ----------------------------------------------
        // Find subject
        // ----------------------------------------------

        const subjectElement =
            row.querySelector(".bog");


        // ----------------------------------------------
        // Find preview
        // ----------------------------------------------

        const previewElement =
            row.querySelector(".y2");


        // ----------------------------------------------
        // Extract information
        // ----------------------------------------------

        const sender =
            senderElement?.getAttribute("email") ||
            senderElement?.innerText ||
            "Unknown";


        const subject =
            subjectElement?.innerText?.trim() ||
            "No subject";


        const preview =
            previewElement?.innerText?.trim() ||
            "";


        // ----------------------------------------------
        // Ignore invalid rows
        // ----------------------------------------------

        if (
            sender === "Unknown" &&
            subject === "No subject"
        ) {

            continue;

        }


        console.log(
            "SmartMail analyzing:",
            subject
        );


        // ----------------------------------------------
        // Mark as processed
        // ----------------------------------------------

        row.dataset.smartmailProcessed =
            "true";


        // ----------------------------------------------
        // Send email to ML API
        // ----------------------------------------------

        const result =
            await classifyWithML(
                subject,
                sender,
                preview
            );


        // ----------------------------------------------
        // API failed
        // ----------------------------------------------

        if (!result) {

            console.warn(
                "SmartMail could not classify:",
                subject
            );

            // Allow retry later
            row.dataset.smartmailProcessed =
                "false";

            continue;

        }


        // ----------------------------------------------
        // Log prediction
        // ----------------------------------------------

        console.log(
            "SmartMail prediction:",
            {
                subject: subject,
                category: result.category,
                confidence: result.confidence
            }
        );


        // ----------------------------------------------
        // Add label to Gmail
        // ----------------------------------------------

        addLabel(
            row,
            result.category,
            result.confidence
        );

    }

}


// ==================================================
// DEBOUNCED AUTOMATIC SCANNING
// ==================================================

let scanTimeout = null;


function scheduleScan() {

    if (scanTimeout) {

        clearTimeout(scanTimeout);

    }


    scanTimeout =
        setTimeout(() => {

            scanInboxWithML();

        }, 1000);

}


// ==================================================
// WATCH FOR GMAIL DOM CHANGES
// ==================================================

const observer =
    new MutationObserver(() => {

        scheduleScan();

    });


observer.observe(
    document.body,
    {
        childList: true,
        subtree: true
    }
);


// ==================================================
// INITIAL SCAN
// ==================================================

setTimeout(() => {

    scanInboxWithML();

}, 2000);


// ==================================================
// EXISTING POPUP SUPPORT
// ==================================================
// Keeps your old popup functionality working.
// The popup can still request an inbox scan.

function scanEmails() {

    const emails = [];

    const rows =
        document.querySelectorAll("tr.zA");


    rows.forEach((row) => {

        const senderElement =
            row.querySelector(".yX span[email]") ||
            row.querySelector(".yW span[email]");


        const subjectElement =
            row.querySelector(".bog");


        const previewElement =
            row.querySelector(".y2");


        const sender =
            senderElement?.getAttribute("email") ||
            senderElement?.innerText ||
            "Unknown";


        const subject =
            subjectElement?.innerText?.trim() ||
            "No subject";


        const preview =
            previewElement?.innerText?.trim() ||
            "";


        if (
            sender === "Unknown" &&
            subject === "No subject"
        ) {

            return;

        }


        emails.push({

            sender: sender,

            subject: subject,

            preview: preview

        });

    });


    console.log(
        "SmartMail detected:",
        emails
    );


    return emails.slice(0, 30);

}


// ==================================================
// MESSAGE LISTENER FOR POPUP
// ==================================================

chrome.runtime.onMessage.addListener(

    (message, sender, sendResponse) => {

        if (
            message.action === "scanInbox"
        ) {

            const emails =
                scanEmails();


            sendResponse({

                success: true,

                emails: emails

            });

        }


        return true;

    }

);