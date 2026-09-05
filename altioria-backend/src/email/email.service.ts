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

  variantId: string;
  variantNameRu: string;
  variantNameEn: string;
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
    return [
      'Новая заявка с сайта Altioria',
      '',
      `Имя: ${inquiry.customerName}`,
      `Email: ${inquiry.customerEmail}`,
      `Телефон: ${inquiry.customerPhone}`,
      '',
      `Товар: ${inquiry.productNameRu} / ${inquiry.productNameEn}`,
      `Вариант: ${inquiry.variantNameRu} / ${inquiry.variantNameEn}`,
      `Product ID: ${inquiry.productId}`,
      `Variant ID: ${inquiry.variantId}`,
      '',
      `Вопрос: ${inquiry.questions ?? 'Не указан'}`,
    ].join('\n');
  }

  private createHtmlMessage(
    inquiry: ProductInquiryEmail,
  ): string {
    const name = this.escapeHtml(
      inquiry.customerName,
    );

    const email = this.escapeHtml(
      inquiry.customerEmail,
    );

    const phone = this.escapeHtml(
      inquiry.customerPhone,
    );

    const questions = this.escapeHtml(
      inquiry.questions ?? 'Не указаны',
    ).replace(/\n/g, '<br>');

    const productRu = this.escapeHtml(
      inquiry.productNameRu,
    );

    const productEn = this.escapeHtml(
      inquiry.productNameEn,
    );

    const variantRu = this.escapeHtml(
      inquiry.variantNameRu,
    );

    const variantEn = this.escapeHtml(
      inquiry.variantNameEn,
    );

    return `
      <div style="font-family: Arial, sans-serif; color: #1a1a1a;">
        <h2>Новая заявка с сайта Altioria</h2>

        <h3>Контактные данные</h3>
        <p><strong>Имя:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Телефон:</strong> ${phone}</p>

        <h3>Товар</h3>
        <p><strong>Название:</strong> ${productRu} / ${productEn}</p>
        <p><strong>Вариант:</strong> ${variantRu} / ${variantEn}</p>
        <p><strong>Product ID:</strong> ${inquiry.productId}</p>
        <p><strong>Variant ID:</strong> ${inquiry.variantId}</p>

        <h3>Вопрос</h3>
        <p>${questions}</p>
      </div>
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