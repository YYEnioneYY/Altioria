import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not specified`);
  }

  return value;
}

export interface ProductInquiryEmail {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  questions: string | null;

  productId: string;
  productNameRu: string;
  productNameEn: string;

  variantId: string | null;
  variantNameRu: string | null;
  variantNameEn: string | null;
}

@Injectable()
export class EmailService {
  private readonly resend = new Resend(
    requireEnv('RESEND_API_KEY'),
  );

  private readonly from = requireEnv('MAIL_FROM');

  private readonly recipient = requireEnv(
    'INQUIRY_RECIPIENT_EMAIL',
  );

  async sendProductInquiry(
    inquiry: ProductInquiryEmail,
  ): Promise<void> {
    const result = await this.resend.emails.send({
      from: this.from,
      to: [this.recipient],
      replyTo: inquiry.customerEmail,
      subject: `Новая заявка: ${inquiry.productNameRu}`,
      text: this.createTextMessage(inquiry),
      html: this.createHtmlMessage(inquiry),
    });

    if (result.error) {
      throw new Error(
        `Resend error: ${result.error.message}`,
      );
    }
  }

  private createTextMessage(
    inquiry: ProductInquiryEmail,
  ): string {
        const variantLines = inquiry.variantId
      ? [
          `Исполнение: ${inquiry.variantNameRu} / ${inquiry.variantNameEn}`,
          `Variant ID: ${inquiry.variantId}`,
        ]
      : [
          'Исполнение: основной товар',
        ];

    return [
      'Новая заявка с сайта Altioria',
      '',
      `Имя: ${inquiry.customerName}`,
      `Email: ${inquiry.customerEmail}`,
      `Телефон: ${inquiry.customerPhone}`,
      '',
      `Товар: ${inquiry.productNameRu} / ${inquiry.productNameEn}`,
      `Product ID: ${inquiry.productId}`,
      ...variantLines,
      '',
      `Вопрос: ${inquiry.questions ?? 'Не указан'}`,
    ].join('\n');
  }

  private createHtmlMessage(
    inquiry: ProductInquiryEmail,
  ): string {
    const customerName = this.escapeHtml(
      inquiry.customerName,
    );
  
    const customerEmail = this.escapeHtml(
      inquiry.customerEmail,
    );
  
    const customerPhone = this.escapeHtml(
      inquiry.customerPhone,
    );
  
    const questions = this.escapeHtml(
      inquiry.questions ?? 'Не указаны',
    ).replace(/\n/g, '<br>');
  
    const productNameRu = this.escapeHtml(
      inquiry.productNameRu,
    );
  
    const productNameEn = this.escapeHtml(
      inquiry.productNameEn,
    );
  
    const productId = this.escapeHtml(
      inquiry.productId,
    );
  
    const variantBlock = inquiry.variantId
      ? `
          <p>
            <strong>Исполнение:</strong>
            ${this.escapeHtml(
              inquiry.variantNameRu ?? 'Не указано',
            )}
            /
            ${this.escapeHtml(
              inquiry.variantNameEn ?? 'Not specified',
            )}
          </p>
  
          <p>
            <strong>Variant ID:</strong>
            ${this.escapeHtml(inquiry.variantId)}
          </p>
        `
      : `
          <p>
            <strong>Исполнение:</strong>
            Основной товар
          </p>
        `;
  
    return `
      <!doctype html>
      <html lang="ru">
        <head>
          <meta charset="utf-8">
          <title>Новая заявка с сайта Altioria</title>
        </head>
  
        <body style="margin: 0; padding: 24px; background-color: #f5f5f5;">
          <div
            style="
              max-width: 640px;
              margin: 0 auto;
              padding: 32px;
              background-color: #ffffff;
              color: #1a1a1a;
              font-family: Arial, sans-serif;
              line-height: 1.5;
            "
          >
            <h2 style="margin-top: 0;">
              Новая заявка с сайта Altioria
            </h2>
  
            <h3>Контактные данные</h3>
  
            <p>
              <strong>Имя:</strong>
              ${customerName}
            </p>
  
            <p>
              <strong>Email:</strong>
              ${customerEmail}
            </p>
  
            <p>
              <strong>Телефон:</strong>
              ${customerPhone}
            </p>
  
            <h3>Товар</h3>
  
            <p>
              <strong>Название:</strong>
              ${productNameRu} / ${productNameEn}
            </p>
  
            <p>
              <strong>Product ID:</strong>
              ${productId}
            </p>
  
            ${variantBlock}
  
            <h3>Вопрос</h3>
  
            <p>
              ${questions}
            </p>
          </div>
        </body>
      </html>
    `;
  }

  private escapeHtml(value: string): string {
    const replacements: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };

    return value.replace(
      /[&<>"']/g,
      (character) =>
        replacements[character] ?? character,
    );
  }
}