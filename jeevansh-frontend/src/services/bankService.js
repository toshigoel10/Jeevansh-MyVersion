import api from './api';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export async function loginBank(bankId, password = '') {
  try {
    const res = await api.post('/banks/login', { bank_id: bankId, password });
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using mock loginBank:', err.message);
    await delay(400);
    return {
      token: 'bank-token-' + Date.now(),
      bank: { id: bankId, name: 'City Hospital Blood Bank' },
    };
  }
}

export async function verifyDonation(token, bankId = 'bank-1', requestId = null) {
  try {
    const res = await api.post('/banks/verify', {
      token,
      bank_id: bankId,
      request_id: requestId,
    });
    return res.data;
  } catch (err) {
    console.warn('Backend unavailable, using mock verifyDonation:', err.message);
    await delay(500);
    return {
      success: true,
      donorName: 'Rahul Sharma',
      bloodType: 'B+',
      requestId: requestId || 'REQ-123456',
    };
  }
}