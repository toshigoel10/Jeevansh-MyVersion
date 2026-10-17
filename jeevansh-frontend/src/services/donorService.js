import api from './api';
import { mockDonors } from './mockData';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export async function registerDonor(data) {
  try {
    const payload = {
      name: data.name,
      phone: data.phone,
      blood_type: data.bloodType || data.blood_type,
      latitude: parseFloat(data.latitude) || 28.6139,
      longitude: parseFloat(data.longitude) || 77.2090,
      city: data.location || 'Delhi NCR',
    };
    const res = await api.post('/donors/register', payload);
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using mock registerDonor:', err.message);
    await delay(600);
    return {
      id: `donor-${Date.now()}`,
      ...data,
      totalDonations: 0,
      livesImpacted: 0,
      badges: [],
      available: true,
    };
  }
}

export async function loginDonor(phone) {
  try {
    const cleanPhone = phone.replace(/[\s-]/g, '');
    const res = await api.post('/donors/login', { phone: cleanPhone });
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using mock loginDonor:', err.message);
    await delay(500);
    const donor = mockDonors.find((d) => d.phone.replace(/[\s-]/g, '') === phone.replace(/[\s-]/g, '')) || mockDonors[0];
    return { token: 'mock-token-' + Date.now(), donor };
  }
}

export async function getDonorDashboard(donorId) {
  try {
    const res = await api.get(`/donors/${donorId}/dashboard`);
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using mock getDonorDashboard:', err.message);
    await delay(400);
    return mockDonors[0];
  }
}

export async function toggleAvailability(donorId, isAvailable) {
  try {
    const res = await api.patch(`/donors/${donorId}/availability`, {
      is_available: isAvailable,
    });
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using mock toggleAvailability:', err.message);
    return { success: true, is_available: isAvailable };
  }
}

export async function getDonorQR(donorId) {
  try {
    const res = await api.get(`/donors/${donorId}/qr`);
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using mock getDonorQR:', err.message);
    return {
      token: `JEEVANSH:${donorId}:O+:123456`,
      donor_id: donorId,
    };
  }
}