import axios from 'axios';

const WA_PHONE_ID = process.env.WA_PHONE_ID || '';
const WA_ACCESS_TOKEN = process.env.WA_ACCESS_TOKEN || '';
const WA_API_URL = `https://graph.facebook.com/v18.0/${WA_PHONE_ID}`;

export interface MessageButton {
  id: string;
  title: string;
}

export interface MessageTemplate {
  name: string;
  language: string;
  components?: any[];
}

export class WhatsAppClient {
  private async send(payload: any) {
    if (!WA_PHONE_ID || !WA_ACCESS_TOKEN) {
      console.log('WhatsApp not configured, skipping send');
      return;
    }

    await axios.post(
      `${WA_API_URL}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${WA_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
  }

  async sendText(to: string, text: string) {
    await this.send({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text }
    });
  }

  async sendButtons(to: string, text: string, buttons: MessageButton[]) {
    if (buttons.length === 0) {
      await this.sendText(to, text);
      return;
    }

    await this.send({
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text },
        action: {
          buttons: buttons.slice(0, 3).map(btn => ({
            type: 'reply',
            reply: { id: btn.id, title: btn.title }
          }))
        }
      }
    });
  }

  async sendImage(to: string, imageUrl: string, caption?: string) {
    await this.send({
      messaging_product: 'whatsapp',
      to,
      type: 'image',
      image: { link: imageUrl, caption: caption || '' }
    });
  }

  async sendTemplate(to: string, template: MessageTemplate) {
    await this.send({
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template
    });
  }

  async markAsRead(messageId: string) {
    await this.send({
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId
    });
  }
}
