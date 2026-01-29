import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
  typescript: true,
});

export const PLANS = {
  FREE: {
    name: "Free",
    maxProjects: 3,
    maxFilesPerProject: 10,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    customBranding: false,
  },
  PRO: {
    name: "Pro",
    maxProjects: 25,
    maxFilesPerProject: 100,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    customBranding: true,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    price: 29,
  },
  TEAM: {
    name: "Team",
    maxProjects: -1, // unlimited
    maxFilesPerProject: -1, // unlimited
    maxFileSize: 100 * 1024 * 1024, // 100MB
    customBranding: true,
    priceId: process.env.STRIPE_TEAM_PRICE_ID,
    price: 79,
  },
} as const;

export async function createCheckoutSession({
  customerId,
  priceId,
  organizationId,
}: {
  customerId: string;
  priceId: string;
  organizationId: string;
}) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?canceled=true`,
    metadata: {
      organizationId,
    },
  });

  return session;
}

export async function createCustomerPortalSession(customerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
  });

  return session;
}

export async function getOrCreateCustomer({
  email,
  name,
  organizationId,
}: {
  email: string;
  name: string;
  organizationId: string;
}) {
  const customers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (customers.data.length > 0) {
    return customers.data[0];
  }

  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      organizationId,
    },
  });

  return customer;
}
