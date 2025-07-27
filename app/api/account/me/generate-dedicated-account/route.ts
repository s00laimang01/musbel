import { processVirtualAccountForUser, sendEmail } from "@/lib/server-utils";
import { httpStatusResponse } from "@/lib/utils";
import { Account } from "@/models/account";
import { User } from "@/models/users";
import { NextRequest, NextResponse } from "next/server";
import { Client } from "@upstash/qstash";
import { configs } from "@/lib/constants";
import { availableBanks } from "@/types";
import { connectToDatabase } from "@/lib/connect-to-db";

// Constants
const RETRY_DELAY_HOURS = 1;
const PREFERRED_BANK = "PALMPAY";

export async function POST(request: NextRequest) {
  //let userId: string = "";

  try {
    // Input validation
    const body = await request.json();

    const { userId: requestUserId = null, signature = null } = body;

    if (!requestUserId || !signature) {
      return NextResponse.json(
        httpStatusResponse(
          400,
          "Missing required fields: userId and signature"
        ),
        { status: 400, statusText: "Error from the request body" }
      );
    }

    // Signature validation
    if (signature.trim() !== configs["X-RAPIDAPI-KEY"]?.trim()) {
      return NextResponse.json(httpStatusResponse(401, "Invalid signature"), {
        status: 401,
      });
    }

    await connectToDatabase();

    // User validation
    const user = await User.findById(requestUserId);

    if (!user) {
      return NextResponse.json(httpStatusResponse(404, "User not found"), {
        status: 404,
      });
    }

    // Check existing account
    const existingAccount = await Account.findOne({
      user: user._id.toString(),
    });

    // If user already has the preferred bank account, return success
    if (existingAccount?.accountDetails?.bankCode === PREFERRED_BANK) {
      return NextResponse.json(
        httpStatusResponse(200, "User already has a PalmPay account")
      );
    }

    // If user has an account but not PalmPay, try to create PalmPay account
    if (existingAccount) {
      return await createPalmPayAccount(user);
    }

    // User has no account, try creating one with available banks
    return await createAccountWithFallback(user);
  } catch (error) {
    console.error("Error in generate-dedicated-account:", error);

    return NextResponse.json(
      httpStatusResponse(
        500,
        error instanceof Error ? error.message : "Internal server error"
      ),
      { status: 500 }
    );
  }
}

async function createPalmPayAccount(user: any) {
  try {
    const accountDetails = await processVirtualAccountForUser(
      user,
      PREFERRED_BANK
    );

    // Validate account creation response
    if (!accountDetails?.accountDetails) {
      throw new Error("Invalid account creation response");
    }

    // Send notification email
    await sendAccountCreationEmail(user, accountDetails);

    return NextResponse.json(
      httpStatusResponse(200, "PalmPay account created successfully")
    );
  } catch (error) {
    console.error("Error creating PalmPay account:", error);

    return NextResponse.json(
      httpStatusResponse(500, "Unable to create PalmPay account"),
      { status: 500 }
    );
  }
}

async function createAccountWithFallback(user: any) {
  const banks: availableBanks[] = [
    "PALMPAY", // Prefer PalmPay first
    "9PSB",
    "BANKLY",
    "PROVIDUS",
    "SAFEHAVEN",
  ];

  let lastError: Error | null = null;

  for (let i = 0; i < banks.length; i++) {
    try {
      const bank = banks[i];
      const accountDetails = await processVirtualAccountForUser(user, bank);

      console.log({ accountDetails });

      await sendAccountCreationEmail(user, accountDetails);

      return NextResponse.json(
        httpStatusResponse(200, `Account created successfully with ${bank}`)
      );
    } catch (error) {
      console.error(`Failed to create account with ${banks[i]}:`, error);
      lastError =
        error instanceof Error ? error : new Error(`Failed with ${banks[i]}`);
      continue;
    }
  }

  return NextResponse.json(
    httpStatusResponse(
      500,
      lastError?.message || "Unable to create account with any provider"
    ),
    { status: 500 }
  );
}

async function sendAccountCreationEmail(user: any, accountDetails: any) {
  try {
    // Validate required data before sending email
    if (
      !accountDetails?.accountDetails?.bankName ||
      !accountDetails?.accountDetails?.accountNumber ||
      !accountDetails?.accountDetails?.accountName
    ) {
      throw new Error("Missing required account details for email");
    }

    const firstName = user.fullName.split(" ")[0] || "Valued Customer";
    const emailTemplate = createEmailTemplate(firstName, accountDetails);

    await sendEmail(
      [user.auth.email],
      emailTemplate,
      "🎉 Account Update Notification"
    );
  } catch (error) {
    console.error("Error sending account creation email:", error);
    // Don't throw - email failure shouldn't fail the account creation
  }
}

function createEmailTemplate(firstName: string, accountDetails: any): string {
  const { bankName, accountNumber, accountName } =
    accountDetails.accountDetails;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Update Notification</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f8f9fa;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            overflow: hidden;
        }
        
        .email-header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 30px 40px;
            text-align: center;
        }
        
        .email-header h2 {
            color: #ffffff;
            font-size: 24px;
            font-weight: 600;
            margin: 0;
        }
        
        .email-body {
            padding: 40px;
        }
        
        .greeting {
            font-size: 18px;
            color: #2c3e50;
            margin-bottom: 20px;
            font-weight: 500;
        }
        
        .content-text {
            font-size: 16px;
            color: #555555;
            margin-bottom: 18px;
            line-height: 1.7;
        }
        
        .highlight-box {
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            color: #ffffff;
            padding: 20px;
            border-radius: 10px;
            margin: 25px 0;
            text-align: center;
            font-weight: 500;
        }
        
        .account-details {
            background-color: #f0fdf4;
            border-left: 4px solid #22c55e;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .account-details h4 {
            color: #2c3e50;
            font-size: 18px;
            margin-bottom: 15px;
            font-weight: 600;
        }
        
        .detail-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #dcfce7;
            font-size: 15px;
        }
        
        .detail-item:last-child {
            border-bottom: none;
        }
        
        .detail-label {
            font-weight: 600;
            color: #495057;
        }
        
        .detail-value {
            color: #2c3e50;
            font-weight: 500;
            text-align: right;
            flex: 1;
            margin-left: 20px;
            word-break: break-all;
        }
        
        .important-note {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
        }
        
        .important-note p {
            color: #92400e;
            margin: 0;
            font-size: 15px;
        }
        
        .support-section {
            background-color: #f0fdf4;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
        }
        
        .support-section p {
            color: #166534;
            margin: 0;
            font-size: 15px;
        }
        
        .email-footer {
            background-color: #2c3e50;
            padding: 30px 40px;
            text-align: center;
        }
        
        .signature {
            color: #ffffff;
            font-size: 16px;
            line-height: 1.5;
        }
        
        .company-name {
            color: #22c55e;
            font-weight: 600;
            font-size: 18px;
        }
        
        .divider {
            height: 2px;
            background: linear-gradient(to right, #22c55e, #16a34a);
            margin: 30px 0;
            border-radius: 1px;
        }
        
        @media (max-width: 600px) {
            .email-body {
                padding: 25px 20px;
            }
            
            .email-header {
                padding: 25px 20px;
            }
            
            .email-footer {
                padding: 25px 20px;
            }
            
            .detail-item {
                flex-direction: column;
                align-items: flex-start;
                gap: 5px;
            }
            
            .detail-value {
                text-align: left;
                margin-left: 0;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h2>🎉 Account Update Notification</h2>
        </div>
        
        <div class="email-body">
            <p class="greeting">Hello ${firstName},</p>
            
            <div class="highlight-box">
                ✨ Great news! We've upgraded your account with ${bankName} virtual account
            </div>
            
            <p class="content-text">
                We're excited to inform you that we've added a <strong>${bankName} virtual account</strong> to your profile to make funding your wallet even faster and more convenient.
            </p>
            
            <div class="important-note">
                <p>
                    <strong>📌 Important:</strong> Your previous bank account is still active and can be used for transactions, though it won't be displayed on your dashboard anymore.
                </p>
            </div>
            
            <div class="account-details">
                <h4>🏦 Your New ${bankName} Account Details</h4>
                <div class="detail-item">
                    <span class="detail-label">Bank Name:</span>
                    <span class="detail-value">${bankName}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Account Number:</span>
                    <span class="detail-value">${accountNumber}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Account Name:</span>
                    <span class="detail-value">${accountName}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Created on:</span>
                    <span class="detail-value">${new Date().toLocaleDateString()}</span>
                </div>
            </div>
            
            <p class="content-text">
                These details will be shown on your dashboard for easy access. You can start using them immediately for faster transactions!
            </p>
            
            <div class="divider"></div>
            
            <div class="support-section">
                <p>
                    <strong>Need Help?</strong> If you have any questions or concerns, please don't hesitate to contact our support team.
                </p>
            </div>
        </div>
        
        <div class="email-footer">
            <div class="signature">
                <p>Best regards,</p>
                <p class="company-name">The KintaSME Team</p>
            </div>
        </div>
    </div>
</body>
</html>`;
}
