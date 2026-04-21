exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { orderId, date, name, phone, service, comment } = JSON.parse(
      event.body
    );

    const TOKEN = process.env.TG_TOKEN;
    const CHAT_IDS = process.env.TG_CHAT_ID
      ? process.env.TG_CHAT_ID.split(",")
      : [];

    // 🔍 DEBUG ENV
    console.log("TOKEN:", TOKEN ? "OK" : "MISSING");
    console.log("CHAT_IDS:", CHAT_IDS);

    const message = [
      `<b>📦 ЗАМОВЛЕННЯ: ${orderId}</b>`,
      `<b>📅 Дата:</b> ${date}`,
      `--------------------------`,
      `<b>👤 Клієнт:</b> ${name || "Не вказано"}`,
      `<b>📞 Тел:</b> <code>${phone || "Не вказано"}</code>`,
      `<b>🛠 Послуга:</b> ${service || "Загальна"}`,
      `<b>💬 Коментар:</b> ${comment || "-"}`,
    ].join("\n");

    const results = [];

    for (const id of CHAT_IDS) {
      const trimmedId = id.trim();

      console.log("➡️ Отправка в chat_id:", trimmedId);

      const response = await fetch(
        `https://api.telegram.org/bot${TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: trimmedId,
            parse_mode: "HTML",
            text: message,
          }),
        }
      );

      const data = await response.text();

      console.log("STATUS:", response.status);
      console.log("TG RESPONSE:", data);

      results.push(response.ok);
    }

    if (results.some((res) => res === true)) {
      return {
        statusCode: 200,
        body: JSON.stringify({ status: "success" }),
      };
    } else {
      return {
        statusCode: 500,
        body: JSON.stringify({ status: "error" }),
      };
    }
  } catch (error) {
    console.error("FUNCTION ERROR:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.toString() }),
    };
  }
};