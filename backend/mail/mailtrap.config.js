/**
 * Configuration object for Mailtrap sender.
 * @type {Object}
 * @property {string} email - The email address of the sender.
 * @property {string} name - The name of the sender.
 */
import { MailtrapClient }from 'mailtrap';
import dotenv from 'dotenv';


dotenv.config();

export const mailtrapClient = new MailtrapClient({
  token: process.env.MAILTRAP_TOKEN,
});

export const mailtrapSender = {
  email: process.env.MAILTRAP_SENDER_EMAIL,
  name: process.env.MAILTRAP_SENDER_NAME,
};