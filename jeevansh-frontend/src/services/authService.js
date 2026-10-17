import { loginDonor, registerDonor } from './donorService';
import { loginBank } from './bankService';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function loginUser({ identifier, password, role }) {
  const cleanId = (identifier || '').trim();

  // If role is donor, attempt backend donor login
  if (role === 'donor') {
    try {
      const res = await loginDonor(cleanId);
      return {
        success: true,
        user: {
          id: res.donor.id,
          name: res.donor.name || 'Hero Donor',
          phone: res.donor.phone || cleanId,
          email: `${cleanId.replace(/\+/g, '')}@donor.jeevansh.org`,
          bloodType: res.donor.bloodType || res.donor.blood_type || 'O+',
          role: 'donor',
          location: res.donor.city || 'Delhi NCR',
          verified: true,
        },
        token: res.token,
      };
    } catch (err) {
      console.warn('Backend donor login fallback:', err.message);
    }
  }

  // If role is blood bank, attempt backend bank login
  if (role === 'bank') {
    try {
      const res = await loginBank(cleanId || 'bank-1', password);
      return {
        success: true,
        user: {
          id: res.bank.id,
          name: res.bank.name,
          phone: '+91 11 2345 6789',
          email: `${res.bank.id}@bloodbank.org`,
          role: 'bank',
          location: 'Delhi NCR',
          verified: true,
        },
        token: res.token,
      };
    } catch (err) {
      console.warn('Backend bank login fallback:', err.message);
    }
  }

  // Standard response for Seeker and Hospital roles
  await delay(400);

  let defaultName = 'User';
  let defaultLocation = 'Delhi NCR';

  if (role === 'hospital') {
    defaultName = cleanId.includes('aiims') ? 'AIIMS Super Specialty Hospital' : 'Max Healthcare Center';
  } else if (role === 'seeker') {
    defaultName = 'Pooja Verma';
  } else if (role === 'donor') {
    defaultName = 'Rahul Sharma';
  } else if (role === 'bank') {
    defaultName = 'City Hospital Blood Bank';
  }

  const userObj = {
    id: `${role}-${Date.now()}`,
    name: defaultName,
    email: cleanId.includes('@') ? cleanId : `${cleanId.replace(/\+/g, '')}@jeevansh.org`,
    phone: cleanId.includes('@') ? '+91 98765 43210' : cleanId,
    role: role || 'seeker',
    location: defaultLocation,
    verified: true,
    bloodType: role === 'donor' ? 'O+' : undefined,
    institutionName: role === 'hospital' || role === 'bank' ? defaultName : undefined,
  };

  return {
    success: true,
    user: userObj,
    token: `token-${role}-${Date.now()}`,
  };
}

export async function registerUser(formData) {
  const role = formData.role || 'seeker';

  if (role === 'donor') {
    try {
      const res = await registerDonor({
        name: formData.name,
        phone: formData.phone,
        bloodType: formData.bloodType || 'O+',
        location: formData.location || 'Delhi NCR',
        latitude: 28.6139,
        longitude: 77.2090,
      });

      return {
        success: true,
        user: {
          id: res.id || res.donor_id || `donor-${Date.now()}`,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          bloodType: formData.bloodType || 'O+',
          role: 'donor',
          location: formData.location || 'Delhi NCR',
          verified: false, // Verification pending
        },
        token: `token-donor-${Date.now()}`,
      };
    } catch (err) {
      console.warn('Backend registration failed, using fallback:', err.message);
    }
  }

  await delay(500);

  const newUser = {
    id: `${role}-${Date.now()}`,
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    role: role,
    location: formData.location || 'Delhi NCR',
    verified: false,
    bloodType: role === 'donor' ? formData.bloodType || 'O+' : undefined,
    institutionName: formData.institutionName || (role === 'hospital' || role === 'bank' ? formData.name : undefined),
    licenseNumber: formData.licenseNumber || undefined,
  };

  return {
    success: true,
    user: newUser,
    token: `token-${role}-${Date.now()}`,
  };
}
