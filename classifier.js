function classifyEmail(subject, sender, preview) {

    const text = (
        subject + " " +
        sender + " " +
        preview
    ).toLowerCase();

    let category = "Other";
    let priority = 30;

    // Career
    if (
        text.includes("interview") ||
        text.includes("job") ||
        text.includes("internship") ||
        text.includes("recruiter") ||
        text.includes("hiring") ||
        text.includes("offer")
    ) {
        category = "Career";
        priority = 90;
    }

    // Education
    else if (
        text.includes("assignment") ||
        text.includes("exam") ||
        text.includes("course") ||
        text.includes("lecture") ||
        text.includes("class") ||
        text.includes("university")
    ) {
        category = "Education";
        priority = 75;
    }

    // Finance
    else if (
        text.includes("bank") ||
        text.includes("transaction") ||
        text.includes("payment") ||
        text.includes("account") ||
        text.includes("credit card")
    ) {
        category = "Finance";
        priority = 80;
    }

    // Shopping
    else if (
        text.includes("order") ||
        text.includes("delivery") ||
        text.includes("shipped") ||
        text.includes("amazon") ||
        text.includes("flipkart")
    ) {
        category = "Shopping";
        priority = 40;
    }

    // Newsletter
    else if (
        text.includes("newsletter") ||
        text.includes("unsubscribe") ||
        text.includes("weekly digest") ||
        text.includes("daily digest")
    ) {
        category = "Newsletter";
        priority = 15;
    }

    // Promotion
    else if (
        text.includes("discount") ||
        text.includes("sale") ||
        text.includes("offer") ||
        text.includes("coupon") ||
        text.includes("deal")
    ) {
        category = "Promotion";
        priority = 10;
    }

    // Security
    else if (
        text.includes("password") ||
        text.includes("security alert") ||
        text.includes("verification code") ||
        text.includes("otp") ||
        text.includes("login")
    ) {
        category = "Security";
        priority = 85;
    }

    return {
        category,
        priority
    };
}