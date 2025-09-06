import { ClientData } from "../types/types";

export const clientData = {
  clientId: parseInt(process.env.NEXT_PUBLIC_CLIENT_ID || '0', 10),
  redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI || '',
  clientSecret: 'SXVsEkfa1hG0br0qC1uQjJCesB3CxjRnfVmq0KSq',
};

