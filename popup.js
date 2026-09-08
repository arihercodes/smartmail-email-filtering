document.getElementById("scan").addEventListener("click", async () => {

    const button = document.getElementById("scan");

    button.innerText = "Analyzing...";
    button.disabled = true;

    try {

        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });

        if (!tab || !tab.url?.includes("mail.google.com")) {
            alert("Please open Gmail first.");
            return;
        }

        const results = await chrome.scripting.executeScript({
            target: {
                tabId: tab.id
            },
            func: scanAndClassifyGmail
        });

        const emails = results[0].result;

        console.log("SmartMail analyzed:", emails);

        displayResults(emails);

        button.innerText = "Analyze Again";

    } catch (error) {

        console.error(error);

        alert(
            "SmartMail error:\n\n" +
            error.message
        );

        button.innerText = "Analyze Inbox";

    } finally {

        button.disabled = false;
    }
});


/*
====================================================
GMAIL SCANNER
====================================================
*/

function scanAndClassifyGmail() {

    const rows = document.querySelectorAll("tr.zA");

    const emails = [];


    rows.forEach(row => {

        const senderElement =
            row.querySelector(".yX span[email]") ||
            row.querySelector(".yW span[email]");

        const subjectElement =
            row.querySelector(".bog");

        const previewElement =
            row.querySelector(".y2");


        const sender =
            senderElement?.getAttribute("email") ||
            senderElement?.innerText?.trim() ||
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


        const result = classifyEmail(
            subject,
            sender,
            preview
        );


        emails.push({

            sender,
            subject,
            preview,

            category: result.category,

            priority: result.priority,

            reason: result.reason

        });

    });


    return emails.slice(0, 30);


    /*
    ==================================================
    WEIGHTED EMAIL CLASSIFIER
    ==================================================
    */

    function classifyEmail(subject, sender, preview) {

        const text = (
            subject + " " +
            sender + " " +
            preview
        ).toLowerCase();


        /*
        Each category gets a score.
        The category with the highest score wins.
        */

        const scores = {

            Career: 0,
            Education: 0,
            Finance: 0,
            Shopping: 0,
            Newsletter: 0,
            Promotion: 0,
            Security: 0,
            Social: 0

        };


        /*
        ==============================================
        CAREER
        ==============================================
        */

        const careerKeywords = {

            "interview": 8,
            "internship": 8,
            "intern ": 6,
            "recruiter": 8,
            "recruitment": 7,
            "hiring": 8,
            "job opportunity": 8,
            "job opening": 8,
            "career opportunity": 8,
            "offer letter": 9,
            "shortlisted": 9,
            "selection": 7,
            "placement": 8,
            "campus placement": 9,
            "resume": 5,
            "application status": 7

        };


        /*
        ==============================================
        EDUCATION
        ==============================================
        */

        const educationKeywords = {

            "assignment": 8,
            "exam": 8,
            "quiz": 7,
            "course": 6,
            "lecture": 7,
            "class": 6,
            "university": 8,
            "college": 8,
            "student": 5,
            "scholarship": 8,
            "hackathon": 8,
            "competition": 7,
            "case competition": 9,

            "cat 2026": 10,
            "cat exam": 10,
            "cat preparation": 10,
            "cat prep": 9,
            "cat coaching": 8,
            "cat test": 9,
            "daily target test": 9,
            "mock test": 8,
            "practice test": 8,
            "practice tests": 8,
            "target test": 8,

            "iit ": 8,
            "iim ": 8,
            "academic": 7,
            "learning": 5,
            "tutorial": 6,
            "study": 5,
            "webinar": 4

        };


        /*
        ==============================================
        FINANCE
        ==============================================
        */

        const financeKeywords = {

            "bank": 7,
            "transaction": 9,
            "debited": 9,
            "credited": 9,
            "payment": 7,
            "invoice": 7,
            "statement": 6,
            "credit card": 9,
            "debit card": 9,
            "loan": 7,
            "emi": 8,
            "account balance": 8,
            "amount debited": 10,
            "amount credited": 10

        };


        /*
        ==============================================
        SHOPPING
        ==============================================
        */

        const shoppingKeywords = {

            "your order": 8,
            "order": 5,
            "delivery": 7,
            "delivered": 8,
            "shipped": 8,
            "shipping": 7,
            "tracking": 7,
            "tracking number": 8,
            "package": 6,
            "amazon": 5,
            "flipkart": 5,
            "myntra": 5,
            "your package": 8

        };


        /*
        ==============================================
        NEWSLETTER
        ==============================================
        */

        const newsletterKeywords = {

            "newsletter": 10,
            "unsubscribe": 7,
            "weekly digest": 10,
            "daily digest": 10,
            "monthly digest": 10,
            "weekly update": 8,
            "daily update": 7,
            "news roundup": 8

        };


        /*
        ==============================================
        PROMOTION
        ==============================================
        */

        const promotionKeywords = {

            "discount": 8,
            "% off": 9,
            "off today": 8,
            "sale": 8,
            "coupon": 9,
            "deal": 7,
            "limited time": 8,
            "special offer": 9,
            "exclusive offer": 9,
            "offer": 4,
            "shop now": 8,
            "buy now": 8,
            "last chance": 8,
            "last few hours": 9,
            "ending soon": 8,
            "flash sale": 10,
            "save ₹": 9,
            "save rs": 9

        };


        /*
        ==============================================
        SECURITY
        ==============================================
        */

        const securityKeywords = {

            "security alert": 10,
            "verification code": 10,
            "verification": 6,
            "one-time password": 10,
            "otp": 9,
            "password": 8,
            "new login": 10,
            "login attempt": 10,
            "account security": 10,
            "logged in from a new device": 10,
            "new device": 8,
            "suspicious activity": 10,
            "unusual activity": 9

        };


        /*
        ==============================================
        SOCIAL
        ==============================================
        */

        const socialKeywords = {

            "linkedin": 7,
            "facebook": 7,
            "instagram": 7,
            "twitter": 7,
            "pinterest": 7,
            "friend request": 8,
            "commented on": 8,
            "mentioned you": 8,
            "connection request": 8,
            "people you may know": 7,
            "social": 4

        };


        /*
        ==============================================
        CALCULATE SCORES
        ==============================================
        */

        addScores(scores, text, careerKeywords);
        addScores(scores, text, educationKeywords);
        addScores(scores, text, financeKeywords);
        addScores(scores, text, shoppingKeywords);
        addScores(scores, text, newsletterKeywords);
        addScores(scores, text, promotionKeywords);
        addScores(scores, text, securityKeywords);
        addScores(scores, text, socialKeywords);


        /*
        ==============================================
        SENDER-BASED SIGNALS
        ==============================================
        */

        if (
            sender.includes("linkedin")
        ) {
            scores.Social += 5;
        }


        if (
            sender.includes("cracku")
        ) {
            scores.Education += 5;
        }


        if (
            sender.includes("noreply@account.pinterest")
        ) {
            scores.Security += 5;
        }


        /*
        ==============================================
        SUBJECT SIGNALS
        ==============================================
        */

        const subjectText =
            subject.toLowerCase();


        /*
        Educational subjects
        */

        if (
            subjectText.includes("cat") &&
            (
                subjectText.includes("test") ||
                subjectText.includes("exam") ||
                subjectText.includes("preparation") ||
                subjectText.includes("target") ||
                subjectText.includes("marathon")
            )
        ) {

            scores.Education += 8;

        }


        /*
        Promotional subjects
        */

        if (
            subjectText.includes("sale") ||
            subjectText.includes("discount") ||
            subjectText.includes("offer") ||
            subjectText.includes("% off") ||
            subjectText.includes("last 4 hours") ||
            subjectText.includes("last chance")
        ) {

            scores.Promotion += 8;

        }


        /*
        ==============================================
        FIND WINNING CATEGORY
        ==============================================
        */

        let bestCategory = "Other";

        let bestScore = 0;


        for (const category in scores) {

            if (
                scores[category] > bestScore
            ) {

                bestScore =
                    scores[category];

                bestCategory =
                    category;

            }

        }


        /*
        ==============================================
        PRIORITY
        ==============================================
        */

        let priority = 30;


        /*
        ==================================================
        BASE PRIORITY BY CATEGORY
        ==================================================
        */

        if (bestCategory === "Security") {

            priority = 90;

        }

        else if (bestCategory === "Career") {

            priority = 75;

        }

        else if (bestCategory === "Finance") {

            priority = 70;

        }

        else if (bestCategory === "Education") {

            priority = 50;

        }

        else if (bestCategory === "Shopping") {

            priority = 35;

        }

        else if (bestCategory === "Social") {

            priority = 20;

        }

        else if (bestCategory === "Newsletter") {

            priority = 10;

        }

        else if (bestCategory === "Promotion") {

            priority = 10;

        }


        /*
        ==================================================
        URGENT SIGNALS
        ==================================================
        */

        if (
            text.includes("urgent") ||
            text.includes("action required") ||
            text.includes("immediately") ||
            text.includes("deadline") ||
            text.includes("respond by") ||
            text.includes("expires today") ||
            text.includes("expires tomorrow")
        ) {

            priority += 20;

        }


        /*
        ==================================================
        VERY IMPORTANT CAREER SIGNALS
        ==================================================
        */

        if (
            text.includes("interview scheduled") ||
            text.includes("interview invitation") ||
            text.includes("offer letter") ||
            text.includes("job offer") ||
            text.includes("shortlisted") ||
            text.includes("selected for")
        ) {

            priority += 20;

        }


        /*
        ==================================================
        IMPORTANT EDUCATION SIGNALS
        ==================================================
        */

        if (
            text.includes("assignment due") ||
            text.includes("exam tomorrow") ||
            text.includes("exam schedule") ||
            text.includes("deadline tomorrow") ||
            text.includes("submission deadline")
        ) {

            priority += 20;

        }


        /*
        ==================================================
        SECURITY ALERTS
        ==================================================
        */

        if (
            bestCategory === "Security" &&
            (
                text.includes("new device") ||
                text.includes("new login") ||
                text.includes("suspicious activity") ||
                text.includes("login attempt")
            )
        ) {

            priority += 10;

        }


        /*
        ==================================================
        CAP
        ==================================================
        */

        priority = Math.min(priority, 100);

        /*
        Strong signals increase priority.
        */

        if (bestScore >= 15) {
            priority += 5;
        }

        if (bestScore >= 25) {
            priority += 5;
        }


        priority =
            Math.min(
                priority,
                100
            );


        /*
        ==============================================
        EXPLANATION
        ==============================================
        */

        let reason = "";


        if (bestCategory === "Career") {

            reason =
                "Strong career, recruitment or job-related signals";

        }

        else if (bestCategory === "Education") {

            reason =
                "Strong education, learning or academic signals";

        }

        else if (bestCategory === "Finance") {

            reason =
                "Financial transaction or account-related signals";

        }

        else if (bestCategory === "Shopping") {

            reason =
                "Order, delivery or shopping-related signals";

        }

        else if (bestCategory === "Newsletter") {

            reason =
                "Newsletter or recurring digest signals";

        }

        else if (bestCategory === "Promotion") {

            reason =
                "Promotional, discount or marketing signals";

        }

        else if (bestCategory === "Security") {

            reason =
                "Security or account verification signals";

        }

        else if (bestCategory === "Social") {

            reason =
                "Social media or networking signals";

        }

        else {

            reason =
                "No strong category signals detected";

        }


        return {

            category: bestCategory,

            priority: priority,

            reason: reason

        };


        /*
        ==============================================
        HELPER
        ==============================================
        */

        function addScores(
            scores,
            text,
            keywords
        ) {

            for (
                const keyword in keywords
            ) {

                if (
                    text.includes(keyword)
                ) {

                    /*
                    Add the weight for
                    every matching keyword.
                    */

                    const weight =
                        keywords[keyword];


                    /*
                    Prevent one category
                    from becoming absurdly large.
                    */

                    scores[
                        getCategoryFromDictionary(
                            keywords
                        )
                    ] += weight;

                }

            }

        }


        /*
        Determine which dictionary
        belongs to which category.
        */

        function getCategoryFromDictionary(dictionary) {

            if (dictionary === careerKeywords)
                return "Career";

            if (dictionary === educationKeywords)
                return "Education";

            if (dictionary === financeKeywords)
                return "Finance";

            if (dictionary === shoppingKeywords)
                return "Shopping";

            if (dictionary === newsletterKeywords)
                return "Newsletter";

            if (dictionary === promotionKeywords)
                return "Promotion";

            if (dictionary === securityKeywords)
                return "Security";

            if (dictionary === socialKeywords)
                return "Social";

            return "Other";
        }

    }

}


/*
====================================================
DISPLAY RESULTS
====================================================
*/

function displayResults(emails) {

    const count = category =>
        emails.filter(
            e => e.category === category
        ).length;


    /*
    COUNTERS
    */

    document.getElementById("important").innerText =
    emails.filter(
        e => e.priority >= 75
    ).length;


    document.getElementById("career").innerText =
        count("Career");


    document.getElementById("education").innerText =
        count("Education");


    document.getElementById("finance").innerText =
        count("Finance");


    document.getElementById("newsletter").innerText =
        count("Newsletter");


    document.getElementById("promotion").innerText =
        count("Promotion");


    document.getElementById("shopping").innerText =
        count("Shopping");


    document.getElementById("security").innerText =
        count("Security");


    document.getElementById("social").innerText =
        count("Social");


    /*
    ORGANIZATION SCORE
    */

    if (emails.length === 0) {

        document.getElementById("health").innerText =
            "0/100";

        return;

    }


    const categorized =
        emails.filter(
            e => e.category !== "Other"
        ).length;


    const important =
    emails.filter(
        e => e.priority >= 75
    ).length;


    const lowPriority =
        emails.filter(
            e =>
                e.category === "Newsletter" ||
                e.category === "Promotion"
        ).length;


    let score = 50;


    score +=
        (categorized / emails.length) * 35;


    score +=
        Math.min(
            important * 2,
            10
        );


    score -=
        Math.min(
            lowPriority,
            15
        );


    score =
        Math.max(
            0,
            Math.min(
                100,
                Math.round(score)
            )
        );


    document.getElementById("health").innerText =
        score + "/100";


    document.getElementById("progress").style.width =
        score + "%";


    /*
    DESCRIPTION
    */

    document.getElementById(
        "scoreDescription"
    ).innerText =
        `${emails.length} emails analyzed • ${categorized} categorized`;


    /*
    SUMMARY
    */

    document.getElementById(
        "summary"
    ).innerHTML = `

        <b>${emails.length}</b> emails analyzed

        &nbsp; • &nbsp;

        <b>${important}</b> high priority

        &nbsp; • &nbsp;

        <b>${lowPriority}</b> low priority

    `;


    /*
    EMAIL LIST
    */

    const container =
        document.getElementById("emails");


    container.innerHTML = "";


    emails
        .slice(0, 10)
        .forEach(email => {

            const div =
                document.createElement("div");


            div.className =
                "email";


            div.innerHTML = `

                <div class="email-subject">
                    ${escapeHTML(email.subject)}
                </div>

                <div class="email-sender">
                    ${escapeHTML(email.sender)}
                </div>

                <div class="email-preview">
                    ${escapeHTML(email.preview)}
                </div>

                <div class="email-bottom">

                    <span class="badge">
                        ${email.category}
                    </span>

                    <span class="priority">
                        ${email.priority}/100
                    </span>

                </div>

                <div class="reason">
                    💡 ${escapeHTML(email.reason)}
                </div>

            `;


            container.appendChild(div);

        });

}


/*
====================================================
HTML ESCAPING
====================================================
*/

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.innerText =
        text || "";

    return div.innerHTML;

}