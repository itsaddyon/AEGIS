// Practice Lab catalogue — mirrors the `simulations` table seed in
// database/schema.sql. Kept in the frontend too so Practice Lab cards can
// render instantly before/without a backend round-trip.

import type { Simulation } from '@/types'

export const SIMULATIONS: Simulation[] = [
  { id: 'fake-inbox', title: 'Fake Email Inbox', category: 'email', difficulty: 'beginner', xp_reward: 60, is_available: 1 },
  { id: 'real-vs-fake-site', title: 'Real Website vs Fake Website', category: 'web', difficulty: 'beginner', xp_reward: 60, is_available: 1 },
  { id: 'qr-scanner', title: 'QR Code Scanner', category: 'qr', difficulty: 'beginner', xp_reward: 40, is_available: 1 },
  { id: 'otp-scam', title: 'OTP Scam Simulation', category: 'otp', difficulty: 'intermediate', xp_reward: 50, is_available: 1 },
  { id: 'phone-call', title: 'Phone Call (Vishing) Simulation', category: 'call', difficulty: 'intermediate', xp_reward: 50, is_available: 1 },
  { id: 'usb-attack', title: 'USB Attack Simulation', category: 'usb', difficulty: 'intermediate', xp_reward: 50, is_available: 1 },
  { id: 'social-chat', title: 'Social Engineering Conversation', category: 'social', difficulty: 'advanced', xp_reward: 70, is_available: 1 },
  { id: 'browser-warning', title: 'Browser Warning Simulator', category: 'browser', difficulty: 'beginner', xp_reward: 40, is_available: 1 },
  { id: 'password-lab', title: 'Password Strength Lab', category: 'password', difficulty: 'beginner', xp_reward: 40, is_available: 1 },
]

export const CATEGORY_LABEL: Record<string, string> = {
  email: 'Email', web: 'Web', qr: 'QR Code', otp: 'OTP Scam', call: 'Phone Call',
  usb: 'USB Drive', social: 'Social Engineering', browser: 'Browser Warning', password: 'Passwords',
}
