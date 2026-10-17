import api from './api';
import { mockDonors, mockBanks } from './mockData';
import { getCompatibleDonors } from '../utils/bloodCompat';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export async function checkBanks(bloodType, lat = 28.6139, lng = 77.2090) {
  try {
    const res = await api.get('/banks', {
      params: { bloodType, latitude: lat, longitude: lng },
    });
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using mock banks:', err.message);
    await delay(300);
    return mockBanks.map((b) => ({
      ...b,
      hasStock: (b.stock[bloodType] || 0) > 0,
      unitsAvailable: b.stock[bloodType] || 0,
    })).sort((a, b) => a.distance - b.distance);
  }
}

export async function createRequest(data) {
  try {
    const payload = {
      blood_type: data.bloodType || data.blood_type,
      latitude: parseFloat(data.latitude) || 28.6139,
      longitude: parseFloat(data.longitude) || 77.2090,
      units: parseInt(data.units, 10) || 1,
      patient_age: data.patientAge ? parseInt(data.patientAge, 10) : null,
      patient_gender: data.patientGender || null,
      hospital_name: data.hospital || null,
      location_text: data.location || null,
    };
    const res = await api.post('/requests', payload);
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using mock createRequest:', err.message);
    await delay(600);
    const compatible = getCompatibleDonors(data.bloodType);
    const matchedDonors = mockDonors
      .filter((d) => compatible.includes(d.bloodType) && d.available)
      .slice(0, 20);

    return {
      id: `REQ-${Date.now().toString().slice(-6)}`,
      ...data,
      status: 'searching',
      createdAt: new Date().toISOString(),
      alertedDonors: matchedDonors.length,
      matchedDonors,
    };
  }
}

export async function getRequestStatus(requestId) {
  try {
    const res = await api.get(`/requests/${requestId}/status`);
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using mock getRequestStatus:', err.message);
    await delay(300);
    const accepted = Math.random() < 0.3;
    return {
      id: requestId,
      status: accepted ? 'donor_found' : 'searching',
      acceptedDonor: accepted
        ? { name: 'Rahul Sharma', phone: '+919876543210', distance: 2.4 }
        : null,
    };
  }
}

export async function acceptRequest(requestId, donorInfo = {}) {
  try {
    const res = await api.post(`/requests/${requestId}/accept`, donorInfo);
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using mock acceptRequest:', err.message);
    return { success: true };
  }
}