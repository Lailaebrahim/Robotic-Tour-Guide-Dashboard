/**
 * A module that sends emails using the Mailtrap API.
 */
import asyncHandler from "express-async-handler";
import { mailtrapClient, mailtrapSender } from "./mailtrap.config.js";
import {
  VERIFICATION_EMAIL_TEMPLATE,
  ACCOUNT_VERIFICATION_EMAIL_TEMPLATE,
  ACCOUNT_COMPLETION_EMAIL_TEMPLATE,
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
} from "./emails.templates.js";

export const sendVerificationEmail = asyncHandler(
  async (email, verificationToken) => {
    const recipients = [
      {
        email: email,
      },
    ];
    const msg = {
      from: mailtrapSender,
      to: recipients,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationToken}",
        verificationToken
      ),
      category: "Email Verification",
    };
    await mailtrapClient.send(msg);
  }
);

export const sendWelcomeEmail = asyncHandler(async (email, username) => {
  const recipients = [
    {
      email: email,
    },
  ];

  const msg = {
    from: mailtrapSender,
    to: recipients,
    template_uuid: "730f777e-e04e-412b-9dca-57c8756abfc5",

    template_variables: {
      company_info_name: "Project 1",
      name: username,
    },
  };
  await mailtrapClient.send(msg);
});

export const sendMemberVerificationEmail = asyncHandler(
  async (username, email, verificationToken) => {
    const recipients = [
      {
        email: email,
      },
    ];
    const msg = {
      from: mailtrapSender,
      to: recipients,
      subject: "Account Verification",
      html: ACCOUNT_VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationToken}",
        verificationToken
      )
        .replace("{username}", username)
        .replace("{verifyEmailURL}", `${process.env.CLIENT_URL}/verify-email`),
      category: "Account Verification",
    };
    await mailtrapClient.send(msg);
  }
);

export const sendAccountCompletionEmail = asyncHandler(
  async (email, activationToken) => {
    const recipients = [
      {
        email: email,
      },
    ];
    const msg = {
      from: mailtrapSender,
      to: recipients,
      subject: "Account Verification",
      html: ACCOUNT_COMPLETION_EMAIL_TEMPLATE.replace(
        "{accountCompletionURL}",
        `${process.env.CLIENT_URL}/complete-account-creation?token=${activationToken}`
      ),
      category: "Account Verification",
    };
    await mailtrapClient.send(msg);
  }
);

export const sendPasswordResetEmail = asyncHandler(
  async (email, resetToken) => {
    const recipients = [
      {
        email: email,
      },
    ];
    const msg = {
      from: mailtrapSender,
      to: recipients,
      subject: "Reset your password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace(
        "{resetURL}",
        `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`
      ),
      category: "Password Reset",
    };
    await mailtrapClient.send(msg);
  }
);

export const sendPasswordResetSuccessEmail = asyncHandler(async (email) => {
  const recipients = [
    {
      email: email,
    },
  ];
  const msg = {
    from: mailtrapSender,
    to: recipients,
    subject: "Password reset successful",
    html: PASSWORD_RESET_SUCCESS_TEMPLATE,
    category: "Password Reset",
  };
  await mailtrapClient.send(msg);
});
