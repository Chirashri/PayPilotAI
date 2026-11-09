const axios = require("axios");

const PAYPAL_BASE_URL =
    process.env.PAYPAL_BASE_URL || "https://api-m.sandbox.paypal.com";

const getPayPalAccessToken = async () => {
    try {
        const response = await axios.post(
            `${PAYPAL_BASE_URL}/v1/oauth2/token`,
            "grant_type=client_credentials",
            {
                auth: {
                    username: process.env.PAYPAL_CLIENT_ID,
                    password: process.env.PAYPAL_CLIENT_SECRET
                },
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        );

        return response.data.access_token;

    } catch (error) {
        console.error(
            "PayPal Authentication Error:",
            error.response?.data || error.message
        );

        throw error;
    }
};

module.exports = {
    getPayPalAccessToken
};