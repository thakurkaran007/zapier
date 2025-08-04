export const validateCaptcha = async (token: string) => {
    try {
        const response = await fetch(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    secret: process.env.RECAPTCHA_SECRET_KEY || '',
                    response: token,
                }),
            }
        );
    
        const { success } = await response.json();
        if (!success) return false;
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}
