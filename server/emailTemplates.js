/**
 * emailTemplates.js
 * HTML-шаблоны писем в стилистике сайта конференции
 * Цветовая схема: #003366 (тёмно-синий), #0056b3 (основной синий)
 */

// Базовая обёртка письма
const baseLayout = (content) => `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Конференция</title>
</head>
<body style="margin:0; padding:0; background-color:#f0f4f8; font-family:'Segoe UI', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">

          <!-- ШАПКА -->
          <tr>
            <td style="
              background: linear-gradient(135deg, #003366 0%, #0056b3 100%);
              border-radius: 10px 10px 0 0;
              padding: 36px 40px 30px;
              text-align: center;
            ">
              <div style="
                display:inline-block;
                background: rgba(255,255,255,0.15);
                border-radius: 50%;
                width: 56px; height: 56px;
                line-height: 56px;
                font-size: 28px;
                margin-bottom: 14px;
              ">🎓</div>
              <h1 style="
                margin: 0;
                color: #ffffff;
                font-size: 20px;
                font-weight: 700;
                letter-spacing: 0.5px;
              ">Научная конференция</h1>
              <p style="
                margin: 6px 0 0;
                color: rgba(255,255,255,0.75);
                font-size: 13px;
              ">Организационный комитет</p>
            </td>
          </tr>

          <!-- ТЕЛО ПИСЬМА -->
          <tr>
            <td style="
              background: #ffffff;
              padding: 36px 40px;
              border-left: 1px solid #dde3ed;
              border-right: 1px solid #dde3ed;
            ">
              ${content}
            </td>
          </tr>

          <!-- ПОДВАЛ -->
          <tr>
            <td style="
              background: #f8f9fa;
              border: 1px solid #dde3ed;
              border-top: none;
              border-radius: 0 0 10px 10px;
              padding: 20px 40px;
              text-align: center;
            ">
              <p style="margin:0; font-size:12px; color:#999; line-height:1.6;">
                Это письмо отправлено автоматически — пожалуйста, не отвечайте на него.<br/>
                © ${new Date().getFullYear()} Организационный комитет конференции
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Письмо: доклад ПРИНЯТ
 */
const acceptedTemplate = ({ first_name, last_name, title }) => {
  const content = `
    <!-- Иконка статуса -->
    <div style="text-align:center; margin-bottom: 28px;">
      <div style="
        display:inline-flex; align-items:center; justify-content:center;
        width:64px; height:64px; border-radius:50%;
        background: #e8f5e9; font-size: 32px;
        border: 3px solid #4caf50;
      ">✅</div>
    </div>

    <h2 style="
      margin: 0 0 8px;
      text-align: center;
      color: #2e7d32;
      font-size: 22px;
      font-weight: 700;
    ">Ваш доклад принят!</h2>

    <p style="text-align:center; color:#666; font-size:14px; margin:0 0 28px;">
      Поздравляем с успешным прохождением отбора
    </p>

    <p style="color: #333; font-size: 15px; margin: 0 0 20px; line-height: 1.6;">
      Уважаемый(ая) <strong>${first_name} ${last_name}</strong>,
    </p>

    <p style="color: #444; font-size: 15px; margin: 0 0 16px; line-height: 1.6;">
      Рады сообщить, что ваш доклад был рассмотрен организационным комитетом
      и <strong style="color: #2e7d32;">принят</strong> для участия в конференции:
    </p>

    <!-- Карточка с названием доклада -->
    <div style="
      background: #f1f8e9;
      border-left: 5px solid #4caf50;
      border-radius: 6px;
      padding: 18px 22px;
      margin: 0 0 24px;
    ">
      <p style="margin:0; font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#81c784; font-weight:600;">
        Название доклада
      </p>
      <p style="margin: 6px 0 0; font-size: 16px; color: #1b5e20; font-weight: 700; line-height: 1.5;">
        ${title}
      </p>
    </div>

    <p style="color: #444; font-size: 15px; margin: 0 0 12px; line-height: 1.6;">
      Дополнительная информация о времени и месте выступления будет направлена вам позднее.
    </p>
    <p style="color: #444; font-size: 15px; margin: 0; line-height: 1.6;">
      Следите за расписанием на сайте конференции.
    </p>

    <!-- Разделитель -->
    <hr style="border:none; border-top: 1px solid #eef0f3; margin: 28px 0;" />

    <p style="color: #888; font-size: 13px; margin: 0; line-height: 1.6;">
      Если у вас возникли вопросы, свяжитесь с организационным комитетом.
    </p>
  `;
  return baseLayout(content);
};

/**
 * Письмо: доклад ОТКЛОНЁН
 */
const rejectedTemplate = ({ first_name, last_name, title }) => {
  const content = `
    <!-- Иконка статуса -->
    <div style="text-align:center; margin-bottom: 28px;">
      <div style="
        display:inline-flex; align-items:center; justify-content:center;
        width:64px; height:64px; border-radius:50%;
        background: #fce4ec; font-size: 32px;
        border: 3px solid #e53935;
      ">❌</div>
    </div>

    <h2 style="
      margin: 0 0 8px;
      text-align: center;
      color: #c62828;
      font-size: 22px;
      font-weight: 700;
    ">Доклад не прошёл отбор</h2>

    <p style="text-align:center; color:#666; font-size:14px; margin:0 0 28px;">
      Решение организационного комитета конференции
    </p>

    <p style="color: #333; font-size: 15px; margin: 0 0 20px; line-height: 1.6;">
      Уважаемый(ая) <strong>${first_name} ${last_name}</strong>,
    </p>

    <p style="color: #444; font-size: 15px; margin: 0 0 16px; line-height: 1.6;">
      К сожалению, по результатам рассмотрения организационным комитетом
      ваш доклад был <strong style="color: #c62828;">отклонён</strong>:
    </p>

    <!-- Карточка с названием доклада -->
    <div style="
      background: #fff5f5;
      border-left: 5px solid #e53935;
      border-radius: 6px;
      padding: 18px 22px;
      margin: 0 0 24px;
    ">
      <p style="margin:0; font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#ef9a9a; font-weight:600;">
        Название доклада
      </p>
      <p style="margin: 6px 0 0; font-size: 16px; color: #7f0000; font-weight: 700; line-height: 1.5;">
        ${title}
      </p>
    </div>

    <p style="color: #444; font-size: 15px; margin: 0 0 12px; line-height: 1.6;">
      Мы ценим ваш интерес к конференции и благодарим за участие в отборе.
    </p>
    <p style="color: #444; font-size: 15px; margin: 0; line-height: 1.6;">
      Вы можете доработать материалы и подать новую заявку на следующую конференцию.
    </p>

    <!-- Разделитель -->
    <hr style="border:none; border-top: 1px solid #eef0f3; margin: 28px 0;" />

    <p style="color: #888; font-size: 13px; margin: 0; line-height: 1.6;">
      Если у вас возникли вопросы, свяжитесь с организационным комитетом.
    </p>
  `;
  return baseLayout(content);
};

/**
 * Письмо: назначено время выступления
 */
const scheduleTemplate = ({ first_name, last_name, title, date, time, duration }) => {
  const content = `
    <!-- Иконка статуса -->
    <div style="text-align:center; margin-bottom: 28px;">
      <div style="
        display:inline-flex; align-items:center; justify-content:center;
        width:64px; height:64px; border-radius:50%;
        background: #e3f2fd; font-size: 32px;
        border: 3px solid #0056b3;
      ">📅</div>
    </div>

    <h2 style="
      margin: 0 0 8px;
      text-align: center;
      color: #003366;
      font-size: 22px;
      font-weight: 700;
    ">Назначено время выступления</h2>

    <p style="text-align:center; color:#666; font-size:14px; margin:0 0 28px;">
      Организационный комитет назначил время вашего доклада
    </p>

    <p style="color: #333; font-size: 15px; margin: 0 0 20px; line-height: 1.6;">
      Уважаемый(ая) <strong>${first_name} ${last_name}</strong>,
    </p>

    <p style="color: #444; font-size: 15px; margin: 0 0 16px; line-height: 1.6;">
      Для вашего доклада назначено время выступления:
    </p>

    <!-- Карточка с названием доклада -->
    <div style="
      background: #f0f4ff;
      border-left: 5px solid #0056b3;
      border-radius: 6px;
      padding: 18px 22px;
      margin: 0 0 16px;
    ">
      <p style="margin:0; font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#7ca0d4; font-weight:600;">
        Доклад
      </p>
      <p style="margin: 6px 0 0; font-size: 16px; color: #003366; font-weight: 700; line-height: 1.5;">
        ${title}
      </p>
    </div>

    <!-- Дата и время -->
    <div style="
      background: #f8f9fa;
      border-radius: 6px;
      padding: 18px 22px;
      margin: 0 0 24px;
      display: flex;
    ">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 6px 0;">
            <span style="color:#888; font-size:13px;">📅 Дата:</span>
            <strong style="color:#333; font-size:15px; margin-left:8px;">${date}</strong>
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0;">
            <span style="color:#888; font-size:13px;">🕐 Время:</span>
            <strong style="color:#333; font-size:15px; margin-left:8px;">${time}</strong>
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 0;">
            <span style="color:#888; font-size:13px;">⏱ Длительность:</span>
            <strong style="color:#333; font-size:15px; margin-left:8px;">${duration} мин.</strong>
          </td>
        </tr>
      </table>
    </div>

    <p style="color: #444; font-size: 15px; margin: 0; line-height: 1.6;">
      Пожалуйста, приходите заранее. Следите за расписанием на сайте конференции.
    </p>

    <!-- Разделитель -->
    <hr style="border:none; border-top: 1px solid #eef0f3; margin: 28px 0;" />

    <p style="color: #888; font-size: 13px; margin: 0; line-height: 1.6;">
      Если у вас возникли вопросы, свяжитесь с организационным комитетом.
    </p>
  `;
  return baseLayout(content);
};

module.exports = { acceptedTemplate, rejectedTemplate, scheduleTemplate };
