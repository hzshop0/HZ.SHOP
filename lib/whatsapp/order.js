export async function sendWhatsAppOrder(env, order) {
    const token = env.WHATSAPP_TOKEN;
    const phoneNumberId = env.WHATSAPP_PHONE_NUMBER_ID;
    const recipient = env.WHATSAPP_RECIPIENT || "96171142827";

    if (!token || !phoneNumberId) {
        throw new Error("WhatsApp API is not configured");
    }

    const response = await fetch(
        `https://graph.facebook.com/v23.0/${phoneNumberId}/messages`,
        {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                to: recipient,
                type: "template",
                template: {
                    name: "hz_shop_order",
                    language: {
                        code: "ar"
                    },
                    components: [
                        {
                            type: "body",
                            parameters: [
                                {
                                    type: "text",
                                    text: String(order.id ?? "")
                                },
                                {
                                    type: "text",
                                    text: String(order.customerName ?? "")
                                },
                                {
                                    type: "text",
                                    text: String(order.phone ?? "")
                                },
                                {
                                    type: "text",
                                    text: String(order.total ?? "")
                                }
                            ]
                        }
                    ]
                }
            })
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result?.error?.message ||
            "Failed to send WhatsApp order"
        );
    }

    return result;
}
